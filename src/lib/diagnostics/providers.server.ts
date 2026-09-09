// Live provider adapters for the Buyerfront Diagnostic Engine.
//
// Server-only. Provider credentials are read from the server environment inside
// each call, are never returned, never logged, and never included in errors.
//
// Every adapter implements the same normalised interface so the orchestrator and
// the measurement layer are provider-agnostic.

import {
  costFromTokens,
  estimateTokens,
  PROVIDER_SECRET_NAMES,
  type ProviderId,
} from "./models";
import { domainFromUrl } from "./measure";

export type ProviderRunInput = {
  prompt: string;
  model: string;
  /** Ask the provider to use its web search / grounding tool. */
  grounded: boolean;
  /** Market context, e.g. "Ireland" or "UK B2B SaaS". */
  market: string;
};

export type NormalisedCitation = {
  url: string;
  domain: string;
  title: string | null;
  position: number;
};

export type ProviderRunResult = {
  provider: ProviderId;
  model: string;
  modelVersion: string | null;
  timestamp: string;
  /** The mode actually used, as reported by the request we sent. */
  groundingMode: "grounded" | "ungrounded";
  status: "success" | "failed";
  rawText: string;
  rawPayload: unknown;
  citations: NormalisedCitation[];
  sourceUrls: string[];
  inputTokens: number | null;
  outputTokens: number | null;
  searchCalls: number | null;
  estimatedCostUsd: number | null;
  actualCostUsd: number | null;
  error: string | null;
  attempts: number;
};

const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 600;

/** Strips anything that could carry a credential or full request detail. */
export function sanitiseProviderError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? "Unknown provider error");
  return raw
    .replace(/Bearer\s+\S+/gi, "[redacted]")
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, "[redacted]")
    .replace(/AIza[A-Za-z0-9_-]{8,}/g, "[redacted]")
    .replace(/pplx-[A-Za-z0-9_-]{8,}/g, "[redacted]")
    .replace(/(api[_-]?key|key|token)=[^&\s]+/gi, "$1=[redacted]")
    .slice(0, 400);
}

export function providerSecret(provider: ProviderId): string | undefined {
  const value = process.env[PROVIDER_SECRET_NAMES[provider]];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function providerConnected(provider: ProviderId): boolean {
  return providerSecret(provider) !== undefined;
}

class RetryableError extends Error {}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!response.ok) {
    const detail = text.slice(0, 500);
    const message = `Provider responded ${response.status}: ${detail}`;
    if (response.status === 429 || response.status >= 500) throw new RetryableError(message);
    throw new Error(message);
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Provider returned a response that could not be parsed as JSON");
  }
}

function dedupeCitations(raw: { url: string; title?: string | null }[]): NormalisedCitation[] {
  const seen = new Map<string, NormalisedCitation>();
  for (const entry of raw) {
    if (!entry.url) continue;
    if (seen.has(entry.url)) continue;
    seen.set(entry.url, {
      url: entry.url,
      domain: domainFromUrl(entry.url),
      title: entry.title ?? null,
      position: seen.size + 1,
    });
  }
  return Array.from(seen.values());
}

function systemInstruction(market: string): string {
  return [
    "You are answering as you normally would for a buyer researching a purchase.",
    market ? `Assume the buyer is in this market context: ${market}.` : "",
    "Name specific vendors or products where relevant.",
  ]
    .filter(Boolean)
    .join(" ");
}

// ---------------------------------------------------------------------------
// OpenAI: Responses API with the web_search tool
// ---------------------------------------------------------------------------

type OpenAiResponse = {
  model?: string;
  output_text?: string;
  output?: {
    type?: string;
    content?: {
      type?: string;
      text?: string;
      annotations?: { type?: string; url?: string; title?: string }[];
    }[];
  }[];
  usage?: { input_tokens?: number; output_tokens?: number };
};

async function callOpenAi(input: ProviderRunInput, apiKey: string): Promise<Partial<ProviderRunResult>> {
  const body: Record<string, unknown> = {
    model: input.model,
    input: [
      { role: "system", content: [{ type: "input_text", text: systemInstruction(input.market) }] },
      { role: "user", content: [{ type: "input_text", text: input.prompt }] },
    ],
    ...(input.grounded ? { tools: [{ type: "web_search" }], tool_choice: "auto" } : {}),
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  const payload = (await readResponse(response)) as OpenAiResponse;

  const messages = payload.output ?? [];
  const text =
    payload.output_text ??
    messages
      .flatMap((item) => item.content ?? [])
      .filter((part) => part.type === "output_text")
      .map((part) => part.text ?? "")
      .join("\n")
      .trim();

  const annotations = messages
    .flatMap((item) => item.content ?? [])
    .flatMap((part) => part.annotations ?? [])
    .filter((annotation) => annotation.type === "url_citation" && annotation.url)
    .map((annotation) => ({ url: annotation.url as string, title: annotation.title ?? null }));

  const searchCalls = messages.filter((item) => item.type === "web_search_call").length;

  return {
    modelVersion: payload.model ?? null,
    rawText: text,
    rawPayload: payload,
    citations: dedupeCitations(annotations),
    inputTokens: payload.usage?.input_tokens ?? null,
    outputTokens: payload.usage?.output_tokens ?? null,
    searchCalls: input.grounded ? searchCalls : 0,
  };
}

// ---------------------------------------------------------------------------
// Google Gemini: generateContent with the google_search tool
// ---------------------------------------------------------------------------

type GeminiResponse = {
  modelVersion?: string;
  candidates?: {
    content?: { parts?: { text?: string }[] };
    groundingMetadata?: {
      webSearchQueries?: string[];
      groundingChunks?: { web?: { uri?: string; title?: string } }[];
    };
  }[];
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
};

async function callGemini(input: ProviderRunInput, apiKey: string): Promise<Partial<ProviderRunResult>> {
  const body: Record<string, unknown> = {
    system_instruction: { parts: [{ text: systemInstruction(input.market) }] },
    contents: [{ role: "user", parts: [{ text: input.prompt }] }],
    ...(input.grounded ? { tools: [{ google_search: {} }] } : {}),
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(body),
    },
  );
  const payload = (await readResponse(response)) as GeminiResponse;

  const candidate = payload.candidates?.[0];
  const text = (candidate?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("\n")
    .trim();

  const chunks = candidate?.groundingMetadata?.groundingChunks ?? [];
  const citations = chunks
    .map((chunk) => chunk.web)
    .filter((web): web is { uri?: string; title?: string } => Boolean(web?.uri))
    .map((web) => ({ url: web.uri as string, title: web.title ?? null }));

  return {
    modelVersion: payload.modelVersion ?? null,
    rawText: text,
    rawPayload: payload,
    citations: dedupeCitations(citations),
    inputTokens: payload.usageMetadata?.promptTokenCount ?? null,
    outputTokens: payload.usageMetadata?.candidatesTokenCount ?? null,
    searchCalls: input.grounded
      ? (candidate?.groundingMetadata?.webSearchQueries?.length ?? 0)
      : 0,
  };
}

// ---------------------------------------------------------------------------
// Perplexity: Sonar chat completions with citations
// ---------------------------------------------------------------------------

type PerplexityResponse = {
  model?: string;
  choices?: { message?: { content?: string } }[];
  citations?: string[];
  search_results?: { url?: string; title?: string }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    num_search_queries?: number;
    cost?: { total_cost?: number };
  };
};

async function callPerplexity(
  input: ProviderRunInput,
  apiKey: string,
): Promise<Partial<ProviderRunResult>> {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: input.model,
      messages: [
        { role: "system", content: systemInstruction(input.market) },
        { role: "user", content: input.prompt },
      ],
    }),
  });
  const payload = (await readResponse(response)) as PerplexityResponse;

  const searchResults = payload.search_results ?? [];
  const citations = searchResults.length
    ? searchResults
        .filter((result) => Boolean(result.url))
        .map((result) => ({ url: result.url as string, title: result.title ?? null }))
    : (payload.citations ?? []).map((url) => ({ url, title: null }));

  return {
    // Sonar models always search; there is no ungrounded Sonar mode, so the run
    // records the mode that was actually used rather than the mode requested.
    groundingMode: "grounded" as const,
    modelVersion: payload.model ?? null,
    rawText: (payload.choices?.[0]?.message?.content ?? "").trim(),
    rawPayload: payload,
    citations: dedupeCitations(citations),
    inputTokens: payload.usage?.prompt_tokens ?? null,
    outputTokens: payload.usage?.completion_tokens ?? null,
    searchCalls: payload.usage?.num_search_queries ?? null,
    actualCostUsd: payload.usage?.cost?.total_cost ?? null,
  };
}

const ADAPTERS: Record<
  ProviderId,
  (input: ProviderRunInput, apiKey: string) => Promise<Partial<ProviderRunResult>>
> = {
  openai: callOpenAi,
  google: callGemini,
  perplexity: callPerplexity,
};

/**
 * Runs one prompt against one provider. Bounded retries only: transient
 * conditions (429, 5xx, network) are retried at most MAX_ATTEMPTS times with
 * exponential backoff. A failure is always recorded as a failure; a response is
 * never fabricated.
 */
export async function runProvider(
  provider: ProviderId,
  input: ProviderRunInput,
): Promise<ProviderRunResult> {
  const base: ProviderRunResult = {
    provider,
    model: input.model,
    modelVersion: null,
    timestamp: new Date().toISOString(),
    groundingMode: input.grounded ? "grounded" : "ungrounded",
    status: "failed",
    rawText: "",
    rawPayload: null,
    citations: [],
    sourceUrls: [],
    inputTokens: null,
    outputTokens: null,
    searchCalls: null,
    estimatedCostUsd: null,
    actualCostUsd: null,
    error: null,
    attempts: 0,
  };

  const apiKey = providerSecret(provider);
  if (!apiKey) {
    return { ...base, error: `${PROVIDER_SECRET_NAMES[provider]} is not configured` };
  }

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const partial = await ADAPTERS[provider](input, apiKey);
      const citations = partial.citations ?? [];
      const fallback = estimateTokens(input.prompt);
      const inputTokens = partial.inputTokens ?? fallback.input;
      const outputTokens = partial.outputTokens ?? fallback.output;
      return {
        ...base,
        ...partial,
        timestamp: new Date().toISOString(),
        status: "success",
        citations,
        sourceUrls: citations.map((citation) => citation.url),
        inputTokens: partial.inputTokens ?? null,
        outputTokens: partial.outputTokens ?? null,
        estimatedCostUsd: costFromTokens(
          provider,
          input.model,
          inputTokens,
          outputTokens,
          input.grounded,
        ),
        actualCostUsd: partial.actualCostUsd ?? null,
        error: null,
        attempts: attempt,
      };
    } catch (error) {
      lastError = error;
      const retryable = error instanceof RetryableError;
      if (!retryable || attempt === MAX_ATTEMPTS) {
        return {
          ...base,
          error: sanitiseProviderError(error),
          attempts: attempt,
        };
      }
      await sleep(BASE_BACKOFF_MS * 2 ** (attempt - 1));
    }
  }

  return { ...base, error: sanitiseProviderError(lastError), attempts: MAX_ATTEMPTS };
}
