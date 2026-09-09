// Provider catalogue, pricing and cost estimation for the Buyerfront Diagnostic
// Engine. Pure module: no secrets, no network, safe to import anywhere.

export type ProviderId = "openai" | "google" | "perplexity";
export const PROVIDER_IDS: ProviderId[] = ["openai", "google", "perplexity"];

export const PROVIDER_LABELS: Record<ProviderId | "manual", string> = {
  openai: "OpenAI",
  google: "Google Gemini",
  perplexity: "Perplexity",
  manual: "Manual import",
};

export const PROVIDER_SECRET_NAMES: Record<ProviderId, string> = {
  openai: "OPENAI_API_KEY",
  google: "GEMINI_API_KEY",
  perplexity: "PERPLEXITY_API_KEY",
};

export type ModelPricing = {
  /** USD per 1M input tokens. */
  inputPerMillion: number;
  /** USD per 1M output tokens. */
  outputPerMillion: number;
  /** USD surcharge per grounded/search-enabled request, when the provider charges one. */
  groundedSurcharge: number;
};

export type ModelOption = {
  id: string;
  label: string;
  supportsGrounding: boolean;
  pricing: ModelPricing;
};

/**
 * Published list prices at build time. Providers change pricing, so every stored
 * cost figure is labelled "estimated" unless the provider returned a real cost.
 */
export const PROVIDER_MODELS: Record<ProviderId, ModelOption[]> = {
  openai: [
    {
      id: "gpt-4.1-mini",
      label: "gpt-4.1-mini",
      supportsGrounding: true,
      pricing: { inputPerMillion: 0.4, outputPerMillion: 1.6, groundedSurcharge: 0.025 },
    },
    {
      id: "gpt-4.1",
      label: "gpt-4.1",
      supportsGrounding: true,
      pricing: { inputPerMillion: 2, outputPerMillion: 8, groundedSurcharge: 0.025 },
    },
    {
      id: "gpt-5",
      label: "gpt-5",
      supportsGrounding: true,
      pricing: { inputPerMillion: 1.25, outputPerMillion: 10, groundedSurcharge: 0.01 },
    },
  ],
  google: [
    {
      id: "gemini-2.5-flash",
      label: "gemini-2.5-flash",
      supportsGrounding: true,
      pricing: { inputPerMillion: 0.3, outputPerMillion: 2.5, groundedSurcharge: 0.0 },
    },
    {
      id: "gemini-2.5-pro",
      label: "gemini-2.5-pro",
      supportsGrounding: true,
      pricing: { inputPerMillion: 1.25, outputPerMillion: 10, groundedSurcharge: 0.0 },
    },
  ],
  perplexity: [
    {
      id: "sonar",
      label: "sonar",
      supportsGrounding: true,
      pricing: { inputPerMillion: 1, outputPerMillion: 1, groundedSurcharge: 0.005 },
    },
    {
      id: "sonar-pro",
      label: "sonar-pro",
      supportsGrounding: true,
      pricing: { inputPerMillion: 3, outputPerMillion: 15, groundedSurcharge: 0.006 },
    },
  ],
};

export const DEFAULT_MODEL: Record<ProviderId, string> = {
  openai: "gpt-4.1-mini",
  google: "gemini-2.5-flash",
  perplexity: "sonar",
};

export function findModel(provider: ProviderId, modelId: string): ModelOption | undefined {
  return PROVIDER_MODELS[provider].find((model) => model.id === modelId);
}

export function pricingFor(provider: ProviderId, modelId: string): ModelPricing {
  const model = findModel(provider, modelId);
  if (model) return model.pricing;
  // Unknown/custom model: use the most expensive published option so cost
  // controls fail closed rather than under-estimating.
  return PROVIDER_MODELS[provider].reduce<ModelPricing>(
    (worst, option) => ({
      inputPerMillion: Math.max(worst.inputPerMillion, option.pricing.inputPerMillion),
      outputPerMillion: Math.max(worst.outputPerMillion, option.pricing.outputPerMillion),
      groundedSurcharge: Math.max(worst.groundedSurcharge, option.pricing.groundedSurcharge),
    }),
    { inputPerMillion: 0, outputPerMillion: 0, groundedSurcharge: 0 },
  );
}

/** Rough token estimate used only for pre-run cost estimation. */
export function estimateTokens(promptText: string): { input: number; output: number } {
  return { input: Math.ceil(promptText.length / 4) + 120, output: 800 };
}

export function costFromTokens(
  provider: ProviderId,
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  grounded: boolean,
): number {
  const pricing = pricingFor(provider, modelId);
  const cost =
    (inputTokens / 1_000_000) * pricing.inputPerMillion +
    (outputTokens / 1_000_000) * pricing.outputPerMillion +
    (grounded ? pricing.groundedSurcharge : 0);
  return Math.round(cost * 1_000_000) / 1_000_000;
}

export type ProviderSelection = {
  provider: ProviderId;
  model: string;
  grounded: boolean;
};

export type CostEstimate = {
  calls: number;
  totalUsd: number;
  perProvider: { provider: ProviderId; model: string; calls: number; usd: number }[];
};

/** enabled prompts x selected providers = expected call count. */
export function estimateDiagnosticCost(
  prompts: string[],
  selections: ProviderSelection[],
): CostEstimate {
  const perProvider = selections.map((selection) => {
    const usd = prompts.reduce((sum, prompt) => {
      const tokens = estimateTokens(prompt);
      return (
        sum +
        costFromTokens(selection.provider, selection.model, tokens.input, tokens.output, selection.grounded)
      );
    }, 0);
    return {
      provider: selection.provider,
      model: selection.model,
      calls: prompts.length,
      usd: Math.round(usd * 1_000_000) / 1_000_000,
    };
  });

  return {
    calls: prompts.length * selections.length,
    totalUsd: Math.round(perProvider.reduce((sum, row) => sum + row.usd, 0) * 1_000_000) / 1_000_000,
    perProvider,
  };
}

export const MEASUREMENT_DISCLAIMER =
  "These measurements describe this controlled prompt set at the recorded time. They are not universal or guaranteed AI rankings.";
