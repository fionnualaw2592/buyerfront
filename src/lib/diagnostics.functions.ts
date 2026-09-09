import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  calculateMetrics,
  compareDiagnostics,
  domainFromUrl,
  extractMentions,
  type BrandConfig,
  type ComparisonInput,
  type MeasuredRun,
  type MentionRecord,
  type SourceRecord,
} from "@/lib/diagnostics/measure";
import {
  DEFAULT_MODEL,
  estimateDiagnosticCost,
  MEASUREMENT_DISCLAIMER,
  PROVIDER_IDS,
  PROVIDER_SECRET_NAMES,
  type ProviderId,
  type ProviderSelection,
} from "@/lib/diagnostics/models";
import { presetPrompts, type DiagnosticTypeId } from "@/lib/diagnostics/presets";

// Internal diagnostic engine.
//
// Access model: identical to the social pipeline. Every function requires the
// shared admin key (BUYERFRONT_ADMIN_KEY), compared server-side with a
// timing-safe digest. Provider credentials are only ever read inside
// providers.server.ts and are never returned to the browser.

const adminKeySchema = z.string().min(16).max(400);

async function assertAdmin(adminKey: string): Promise<void> {
  const secret = process.env["BUYERFRONT_ADMIN_KEY"];
  if (!secret) throw new Error("Admin access is not configured");
  const { createHash, timingSafeEqual } = await import("node:crypto");
  const digest = (value: string) => createHash("sha256").update(value, "utf8").digest();
  if (!timingSafeEqual(digest(adminKey.trim()), digest(secret.trim()))) {
    throw new Error("Unauthorized");
  }
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function safeMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : "Unknown error";
  return raw
    .replace(/Bearer\s+\S+/gi, "[redacted]")
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, "[redacted]")
    .slice(0, 400);
}

const providerIdSchema = z.enum(["openai", "google", "perplexity"]);
const diagnosticTypeSchema = z.enum(["mini_signal", "snapshot", "deep_dive", "monitoring"]);

const providerConfigSchema = z.record(
  providerIdSchema,
  z.object({ enabled: z.boolean(), model: z.string().min(1).max(80), grounded: z.boolean() }),
);
type ProviderConfig = z.infer<typeof providerConfigSchema>;

function defaultProviderConfig(): ProviderConfig {
  return {
    openai: { enabled: true, model: DEFAULT_MODEL.openai, grounded: true },
    google: { enabled: true, model: DEFAULT_MODEL.google, grounded: true },
    perplexity: { enabled: true, model: DEFAULT_MODEL.perplexity, grounded: true },
  };
}

function readProviderConfig(value: unknown): ProviderConfig {
  const parsed = providerConfigSchema.safeParse(value);
  if (!parsed.success) return defaultProviderConfig();
  return { ...defaultProviderConfig(), ...parsed.data };
}

function selections(config: ProviderConfig): ProviderSelection[] {
  return PROVIDER_IDS.filter((provider) => config[provider]?.enabled).map((provider) => ({
    provider,
    model: config[provider]?.model ?? DEFAULT_MODEL[provider],
    grounded: config[provider]?.grounded ?? true,
  }));
}

function brandConfigs(
  diagnostic: { company_name: string; target_aliases: string[] | null },
  competitors: { competitor_name: string; aliases: string[] | null }[],
): BrandConfig[] {
  return [
    {
      canonical: diagnostic.company_name,
      names: [diagnostic.company_name, ...(diagnostic.target_aliases ?? [])],
      isTarget: true,
    },
    ...competitors.map((competitor) => ({
      canonical: competitor.competitor_name,
      names: [competitor.competitor_name, ...(competitor.aliases ?? [])],
      isTarget: false,
    })),
  ];
}

// ---------------------------------------------------------------------------
// Provider status
// ---------------------------------------------------------------------------

export const getProviderStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { adminKey: string }) =>
    z.object({ adminKey: adminKeySchema }).parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const { providerConnected } = await import("@/lib/diagnostics/providers.server");
    return {
      providers: PROVIDER_IDS.map((provider) => ({
        provider,
        // Boolean presence only. The secret value is never returned.
        connected: providerConnected(provider),
        secretName: PROVIDER_SECRET_NAMES[provider],
      })),
      disclaimer: MEASUREMENT_DISCLAIMER,
    };
  });

// ---------------------------------------------------------------------------
// Diagnostics CRUD
// ---------------------------------------------------------------------------

export const listDiagnostics = createServerFn({ method: "POST" })
  .inputValidator((data: { adminKey: string }) =>
    z.object({ adminKey: adminKeySchema }).parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();
    const { data: rows, error } = await db
      .from("diagnostics")
      .select(
        "id, diagnostic_number, company_name, website, market, diagnostic_type, status, created_at, completed_at, baseline_diagnostic_id",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(safeMessage(error));
    return { rows: rows ?? [] };
  });

export const createDiagnostic = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      adminKey: string;
      companyName: string;
      website: string;
      market: string;
      diagnosticType: DiagnosticTypeId;
      category: string;
      targetAliases: string[];
      competitors: { name: string; website: string; aliases: string[] }[];
    }) =>
      z
        .object({
          adminKey: adminKeySchema,
          companyName: z.string().trim().min(1).max(200),
          website: z.string().trim().min(1).max(300),
          market: z.string().trim().min(1).max(120),
          diagnosticType: diagnosticTypeSchema,
          category: z.string().trim().min(1).max(160),
          targetAliases: z.array(z.string().trim().min(1).max(120)).max(20),
          competitors: z
            .array(
              z.object({
                name: z.string().trim().min(1).max(200),
                website: z.string().trim().max(300),
                aliases: z.array(z.string().trim().min(1).max(120)).max(20),
              }),
            )
            .max(20),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();

    const { data: last } = await db
      .from("diagnostics")
      .select("diagnostic_number")
      .order("created_at", { ascending: false })
      .limit(50);
    const highest = (last ?? []).reduce((max, row) => {
      const match = /^BF-D(\d+)$/.exec(row.diagnostic_number ?? "");
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
    const diagnosticNumber = `BF-D${String(highest + 1).padStart(3, "0")}`;

    const { data: created, error } = await db
      .from("diagnostics")
      .insert({
        diagnostic_number: diagnosticNumber,
        company_name: data.companyName,
        website: data.website,
        market: data.market,
        diagnostic_type: data.diagnosticType,
        status: "draft",
        target_aliases: data.targetAliases,
        provider_config: defaultProviderConfig(),
      })
      .select("id, diagnostic_number")
      .single();
    if (error || !created) throw new Error(safeMessage(error));

    if (data.competitors.length) {
      const { error: competitorError } = await db.from("diagnostic_competitors").insert(
        data.competitors.map((competitor) => ({
          diagnostic_id: created.id,
          competitor_name: competitor.name,
          competitor_website: competitor.website || null,
          aliases: competitor.aliases,
        })),
      );
      if (competitorError) throw new Error(safeMessage(competitorError));
    }

    const prompts = presetPrompts(data.diagnosticType, data.category, data.market);
    if (prompts.length) {
      const { error: promptError } = await db.from("diagnostic_prompts").insert(
        prompts.map((prompt, index) => ({
          diagnostic_id: created.id,
          prompt_number: index + 1,
          prompt_text: prompt.prompt_text,
          intent_type: prompt.intent_type,
          enabled: true,
        })),
      );
      if (promptError) throw new Error(safeMessage(promptError));
    }

    return { id: created.id, diagnosticNumber: created.diagnostic_number };
  });

export const updateDiagnostic = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      adminKey: string;
      id: string;
      market?: string;
      diagnosticType?: DiagnosticTypeId;
      status?: "draft" | "ready" | "archived";
      targetAliases?: string[];
      providerConfig?: ProviderConfig;
      maxEstimatedCostUsd?: number;
      maxProviderCalls?: number;
      notes?: string;
      baselineDiagnosticId?: string | null;
    }) =>
      z
        .object({
          adminKey: adminKeySchema,
          id: z.string().uuid(),
          market: z.string().trim().min(1).max(120).optional(),
          diagnosticType: diagnosticTypeSchema.optional(),
          status: z.enum(["draft", "ready", "archived"]).optional(),
          targetAliases: z.array(z.string().trim().min(1).max(120)).max(20).optional(),
          providerConfig: providerConfigSchema.optional(),
          maxEstimatedCostUsd: z.number().min(0).max(500).optional(),
          maxProviderCalls: z.number().int().min(0).max(2000).optional(),
          notes: z.string().max(4000).optional(),
          baselineDiagnosticId: z.string().uuid().nullish(),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();
    const patch: Record<string, unknown> = {};
    if (data.market !== undefined) patch["market"] = data.market;
    if (data.diagnosticType !== undefined) patch["diagnostic_type"] = data.diagnosticType;
    if (data.status !== undefined) patch["status"] = data.status;
    if (data.targetAliases !== undefined) patch["target_aliases"] = data.targetAliases;
    if (data.providerConfig !== undefined) patch["provider_config"] = data.providerConfig;
    if (data.maxEstimatedCostUsd !== undefined)
      patch["max_estimated_cost_usd"] = data.maxEstimatedCostUsd;
    if (data.maxProviderCalls !== undefined) patch["max_provider_calls"] = data.maxProviderCalls;
    if (data.notes !== undefined) patch["notes"] = data.notes;
    if (data.baselineDiagnosticId !== undefined)
      patch["baseline_diagnostic_id"] = data.baselineDiagnosticId;

    const { error } = await db.from("diagnostics").update(patch as never).eq("id", data.id);
    if (error) throw new Error(safeMessage(error));
    return { ok: true as const };
  });

export const saveCompetitors = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      adminKey: string;
      id: string;
      competitors: { name: string; website: string; aliases: string[] }[];
    }) =>
      z
        .object({
          adminKey: adminKeySchema,
          id: z.string().uuid(),
          competitors: z
            .array(
              z.object({
                name: z.string().trim().min(1).max(200),
                website: z.string().trim().max(300),
                aliases: z.array(z.string().trim().min(1).max(120)).max(20),
              }),
            )
            .max(20),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();
    await db.from("diagnostic_competitors").delete().eq("diagnostic_id", data.id);
    if (data.competitors.length) {
      const { error } = await db.from("diagnostic_competitors").insert(
        data.competitors.map((competitor) => ({
          diagnostic_id: data.id,
          competitor_name: competitor.name,
          competitor_website: competitor.website || null,
          aliases: competitor.aliases,
        })),
      );
      if (error) throw new Error(safeMessage(error));
    }
    return { ok: true as const };
  });

export const savePrompts = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      adminKey: string;
      id: string;
      prompts: { text: string; intentType: string; enabled: boolean }[];
    }) =>
      z
        .object({
          adminKey: adminKeySchema,
          id: z.string().uuid(),
          prompts: z
            .array(
              z.object({
                text: z.string().trim().min(3).max(1000),
                intentType: z.string().trim().min(1).max(60),
                enabled: z.boolean(),
              }),
            )
            .max(120),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();
    // Prompts already referenced by stored runs keep their evidence: the run row
    // retains prompt_text, and prompt_id is set to null by the FK on delete.
    await db.from("diagnostic_prompts").delete().eq("diagnostic_id", data.id);
    if (data.prompts.length) {
      const { error } = await db.from("diagnostic_prompts").insert(
        data.prompts.map((prompt, index) => ({
          diagnostic_id: data.id,
          prompt_number: index + 1,
          prompt_text: prompt.text,
          intent_type: prompt.intentType,
          enabled: prompt.enabled,
        })),
      );
      if (error) throw new Error(safeMessage(error));
    }
    return { ok: true as const };
  });

// ---------------------------------------------------------------------------
// Detail, metrics and evidence
// ---------------------------------------------------------------------------

const RUN_COLUMNS =
  "id, prompt_id, prompt_text, provider, model_name, model_version, grounding_mode, run_timestamp, raw_response, citations_json, source_urls_json, run_status, error_message, input_tokens, output_tokens, search_calls, estimated_cost_usd, actual_cost_usd, is_test_connection, is_manual_import";

async function loadDiagnosticBundle(id: string) {
  const db = await admin();
  const [diagnostic, competitors, prompts, runs, findings, sources] = await Promise.all([
    db.from("diagnostics").select("*").eq("id", id).maybeSingle(),
    db
      .from("diagnostic_competitors")
      .select("id, competitor_name, competitor_website, aliases")
      .eq("diagnostic_id", id)
      .order("created_at"),
    db
      .from("diagnostic_prompts")
      .select("id, prompt_number, prompt_text, intent_type, enabled")
      .eq("diagnostic_id", id)
      .order("prompt_number"),
    db
      .from("diagnostic_runs")
      .select(RUN_COLUMNS)
      .eq("diagnostic_id", id)
      .order("run_timestamp", { ascending: false }),
    db
      .from("diagnostic_findings")
      .select("id, finding_type, finding, supporting_evidence, run_ids, created_at")
      .eq("diagnostic_id", id)
      .order("created_at"),
    db
      .from("diagnostic_sources")
      .select("id, run_id, source_url, domain, provider, citation_position, frequency")
      .eq("diagnostic_id", id),
  ]);

  if (diagnostic.error) throw new Error(safeMessage(diagnostic.error));
  if (!diagnostic.data) throw new Error("Diagnostic not found");

  const runRows = runs.data ?? [];
  const runIds = runRows.map((run) => run.id);
  let mentionRows: {
    id: string;
    run_id: string;
    brand_name: string;
    canonical_brand_name: string;
    mention_position: number;
    is_target_brand: boolean;
    is_competitor: boolean;
    is_top_3: boolean;
    is_first_mentioned: boolean;
    recommendation_context: string | null;
  }[] = [];
  if (runIds.length) {
    const { data: mentions, error } = await db
      .from("diagnostic_mentions")
      .select(
        "id, run_id, brand_name, canonical_brand_name, mention_position, is_target_brand, is_competitor, is_top_3, is_first_mentioned, recommendation_context",
      )
      .in("run_id", runIds);
    if (error) throw new Error(safeMessage(error));
    mentionRows = mentions ?? [];
  }

  return {
    diagnostic: diagnostic.data,
    competitors: competitors.data ?? [],
    prompts: prompts.data ?? [],
    runs: runRows,
    findings: findings.data ?? [],
    sources: sources.data ?? [],
    mentions: mentionRows,
  };
}

type Bundle = Awaited<ReturnType<typeof loadDiagnosticBundle>>;

function metricsFromBundle(bundle: Bundle) {
  const brands = brandConfigs(bundle.diagnostic, bundle.competitors);
  const measuredRuns: MeasuredRun[] = bundle.runs.map((run) => ({
    id: run.id,
    provider: run.provider,
    model: run.model_name,
    status: run.run_status as MeasuredRun["status"],
    isTestConnection: run.is_test_connection,
  }));
  const mentionRecords: MentionRecord[] = bundle.mentions.map((mention) => ({
    runId: mention.run_id,
    canonicalBrandName: mention.canonical_brand_name,
    mentionPosition: mention.mention_position,
    isTop3: mention.is_top_3,
    isFirstMentioned: mention.is_first_mentioned,
  }));
  const sourceRecords: SourceRecord[] = bundle.sources
    .filter((source): source is typeof source & { run_id: string } => Boolean(source.run_id))
    .map((source) => ({
      runId: source.run_id,
      provider: source.provider,
      url: source.source_url,
      domain: source.domain,
    }));
  return calculateMetrics(measuredRuns, mentionRecords, brands, sourceRecords);
}

function costSummary(bundle: Bundle) {
  const scored = bundle.runs;
  const byProvider = Array.from(new Set(scored.map((run) => run.provider))).map((provider) => {
    const rows = scored.filter((run) => run.provider === provider);
    return {
      provider,
      calls: rows.length,
      estimatedUsd:
        Math.round(rows.reduce((sum, run) => sum + Number(run.estimated_cost_usd ?? 0), 0) * 1e6) /
        1e6,
      actualUsd:
        Math.round(rows.reduce((sum, run) => sum + Number(run.actual_cost_usd ?? 0), 0) * 1e6) / 1e6,
      inputTokens: rows.reduce((sum, run) => sum + (run.input_tokens ?? 0), 0),
      outputTokens: rows.reduce((sum, run) => sum + (run.output_tokens ?? 0), 0),
    };
  });
  return {
    byProvider,
    totalEstimatedUsd: Math.round(byProvider.reduce((sum, row) => sum + row.estimatedUsd, 0) * 1e6) / 1e6,
    totalActualUsd: Math.round(byProvider.reduce((sum, row) => sum + row.actualUsd, 0) * 1e6) / 1e6,
  };
}

export const getDiagnostic = createServerFn({ method: "POST" })
  .inputValidator((data: { adminKey: string; id: string }) =>
    z.object({ adminKey: adminKeySchema, id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const bundle = await loadDiagnosticBundle(data.id);
    const db = await admin();
    const { providerConnected } = await import("@/lib/diagnostics/providers.server");

    const config = readProviderConfig(bundle.diagnostic.provider_config);
    const enabledPrompts = bundle.prompts.filter((prompt) => prompt.enabled);
    const selected = selections(config).filter((selection) => providerConnected(selection.provider));
    const estimate = estimateDiagnosticCost(
      enabledPrompts.map((prompt) => prompt.prompt_text),
      selected,
    );

    const { data: comparisons } = await db
      .from("diagnostic_monitoring_comparisons")
      .select("id, baseline_diagnostic_id, comparison_diagnostic_id, comparison_metadata, comparison_results, created_at")
      .or(`baseline_diagnostic_id.eq.${data.id},comparison_diagnostic_id.eq.${data.id}`)
      .order("created_at", { ascending: false });

    return {
      ...bundle,
      providerConfig: config,
      providerStatus: PROVIDER_IDS.map((provider) => ({
        provider,
        connected: providerConnected(provider),
        secretName: PROVIDER_SECRET_NAMES[provider],
      })),
      estimate,
      metrics: metricsFromBundle(bundle),
      costSummary: costSummary(bundle),
      comparisons: comparisons ?? [],
      disclaimer: MEASUREMENT_DISCLAIMER,
    };
  });

export const getRunPayload = createServerFn({ method: "POST" })
  .inputValidator((data: { adminKey: string; runId: string }) =>
    z.object({ adminKey: adminKeySchema, runId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();
    const { data: run, error } = await db
      .from("diagnostic_runs")
      .select("id, provider, model_name, raw_response, raw_payload, citations_json, source_urls_json")
      .eq("id", data.runId)
      .maybeSingle();
    if (error) throw new Error(safeMessage(error));
    if (!run) throw new Error("Run not found");
    return { run };
  });

// ---------------------------------------------------------------------------
// Storing a run and extracting mentions
// ---------------------------------------------------------------------------

type StoredRunInput = {
  diagnosticId: string;
  promptId: string | null;
  promptText: string;
  provider: ProviderId | "manual";
  model: string;
  modelVersion: string | null;
  groundingMode: string;
  status: "success" | "failed";
  rawText: string;
  rawPayload: unknown;
  citations: { url: string; domain: string; title: string | null; position: number }[];
  inputTokens: number | null;
  outputTokens: number | null;
  searchCalls: number | null;
  estimatedCostUsd: number | null;
  actualCostUsd: number | null;
  error: string | null;
  isTestConnection?: boolean;
  isManualImport?: boolean;
};

/**
 * Persists the raw evidence FIRST, then derives mentions and sources from the
 * stored text. Nothing is fabricated: a failed provider call is stored as a
 * failed run with its sanitised error and no mentions.
 */
async function storeRun(input: StoredRunInput, brands: BrandConfig[]) {
  const db = await admin();
  const { data: run, error } = await db
    .from("diagnostic_runs")
    .insert({
      diagnostic_id: input.diagnosticId,
      prompt_id: input.promptId,
      prompt_text: input.promptText,
      provider: input.provider,
      model_name: input.model,
      model_version: input.modelVersion,
      grounding_mode: input.groundingMode,
      raw_response: input.rawText || null,
      raw_payload: (input.rawPayload ?? null) as never,
      citations_json: input.citations as never,
      source_urls_json: input.citations.map((citation) => citation.url) as never,
      run_status: input.status,
      error_message: input.error,
      input_tokens: input.inputTokens,
      output_tokens: input.outputTokens,
      search_calls: input.searchCalls,
      estimated_cost_usd: input.estimatedCostUsd,
      actual_cost_usd: input.actualCostUsd,
      is_test_connection: input.isTestConnection ?? false,
      is_manual_import: input.isManualImport ?? false,
    })
    .select("id")
    .single();
  if (error || !run) throw new Error(safeMessage(error));

  if (input.status === "success" && input.rawText) {
    const mentions = extractMentions(input.rawText, brands);
    if (mentions.length) {
      await db.from("diagnostic_mentions").insert(
        mentions.map((mention) => ({
          run_id: run.id,
          brand_name: mention.brandName,
          canonical_brand_name: mention.canonicalBrandName,
          mention_position: mention.mentionPosition,
          character_offset: mention.characterOffset,
          is_target_brand: mention.isTargetBrand,
          is_competitor: mention.isCompetitor,
          is_top_3: mention.isTop3,
          is_first_mentioned: mention.isFirstMentioned,
          recommendation_context: mention.recommendationContext,
        })),
      );
    }
    if (input.citations.length) {
      await db.from("diagnostic_sources").insert(
        input.citations.map((citation) => ({
          diagnostic_id: input.diagnosticId,
          run_id: run.id,
          source_url: citation.url,
          domain: citation.domain,
          provider: input.provider,
          citation_position: citation.position,
          frequency: 1,
        })),
      );
    }
  }

  return run.id;
}

// ---------------------------------------------------------------------------
// Test connection
// ---------------------------------------------------------------------------

export const testProviderConnection = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { adminKey: string; id: string; provider: ProviderId; confirm: true }) =>
      z
        .object({
          adminKey: adminKeySchema,
          id: z.string().uuid(),
          provider: providerIdSchema,
          // Explicit admin confirmation is required for every paid call.
          confirm: z.literal(true),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const { providerConnected, runProvider } = await import("@/lib/diagnostics/providers.server");
    if (!providerConnected(data.provider)) {
      return {
        ok: false as const,
        error: `${PROVIDER_SECRET_NAMES[data.provider]} is not configured, so connection testing is disabled for this provider.`,
      };
    }

    const bundle = await loadDiagnosticBundle(data.id);
    const config = readProviderConfig(bundle.diagnostic.provider_config);
    const selection = config[data.provider] ?? {
      enabled: true,
      model: DEFAULT_MODEL[data.provider],
      grounded: true,
    };
    const brands = brandConfigs(bundle.diagnostic, bundle.competitors);

    // Exactly one deliberately small request.
    const prompt = `Name two well known ${bundle.diagnostic.company_name ? "software" : ""} vendors. Answer in one short sentence.`;
    const result = await runProvider(data.provider, {
      prompt,
      model: selection.model,
      grounded: selection.grounded,
      market: bundle.diagnostic.market,
    });

    const runId = await storeRun(
      {
        diagnosticId: data.id,
        promptId: null,
        promptText: prompt,
        provider: data.provider,
        model: result.model,
        modelVersion: result.modelVersion,
        groundingMode: result.groundingMode,
        status: result.status,
        rawText: result.rawText,
        rawPayload: result.rawPayload,
        citations: result.citations,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        searchCalls: result.searchCalls,
        estimatedCostUsd: result.estimatedCostUsd,
        actualCostUsd: result.actualCostUsd,
        error: result.error,
        isTestConnection: true,
      },
      brands,
    );

    return {
      ok: result.status === "success",
      error: result.error,
      runId,
      provider: data.provider,
      model: result.model,
      modelVersion: result.modelVersion,
      groundingMode: result.groundingMode,
      citations: result.citations.length,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      estimatedCostUsd: result.estimatedCostUsd,
      actualCostUsd: result.actualCostUsd,
      responsePreview: result.rawText.slice(0, 400),
    };
  });

// ---------------------------------------------------------------------------
// Run diagnostic
// ---------------------------------------------------------------------------

export const runDiagnostic = createServerFn({ method: "POST" })
  .inputValidator((data: { adminKey: string; id: string; confirm: true; force?: boolean }) =>
    z
      .object({
        adminKey: adminKeySchema,
        id: z.string().uuid(),
        confirm: z.literal(true),
        force: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();
    const { providerConnected, runProvider } = await import("@/lib/diagnostics/providers.server");

    const bundle = await loadDiagnosticBundle(data.id);
    const diagnostic = bundle.diagnostic;

    // Duplicate-run protection.
    if (diagnostic.status === "running") {
      return { ok: false as const, error: "This diagnostic is already running." };
    }
    const existingRuns = bundle.runs.filter((run) => !run.is_test_connection);
    if (existingRuns.length > 0 && !data.force) {
      return {
        ok: false as const,
        error:
          "This diagnostic already has stored runs. Create a monitoring rerun to measure again, or confirm a forced rerun.",
      };
    }

    const config = readProviderConfig(diagnostic.provider_config);
    const enabledPrompts = bundle.prompts.filter((prompt) => prompt.enabled);
    const chosen = selections(config);
    const available = chosen.filter((selection) => providerConnected(selection.provider));

    if (!enabledPrompts.length) return { ok: false as const, error: "No enabled prompts." };
    if (!available.length) {
      return {
        ok: false as const,
        error: "Live providers not connected. Diagnostic architecture is ready.",
      };
    }

    // Cost controls fail closed: abort before any call when a hard limit would be exceeded.
    const estimate = estimateDiagnosticCost(
      enabledPrompts.map((prompt) => prompt.prompt_text),
      available,
    );
    const maxCalls = Number(diagnostic.max_provider_calls ?? 0);
    const maxCost = Number(diagnostic.max_estimated_cost_usd ?? 0);
    if (estimate.calls > maxCalls) {
      return {
        ok: false as const,
        error: `Aborted: ${estimate.calls} expected calls exceeds the configured limit of ${maxCalls}.`,
      };
    }
    if (estimate.totalUsd > maxCost) {
      return {
        ok: false as const,
        error: `Aborted: estimated cost $${estimate.totalUsd.toFixed(4)} exceeds the configured limit of $${maxCost.toFixed(2)}.`,
      };
    }

    await db
      .from("diagnostics")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", data.id);

    const brands = brandConfigs(diagnostic, bundle.competitors);
    let succeeded = 0;
    let failed = 0;
    let spentEstimate = 0;
    let aborted: string | null = null;
    const providerResults: { provider: ProviderId; success: number; failed: number }[] = [];

    try {
      for (const selection of available) {
        let providerSuccess = 0;
        let providerFailed = 0;
        for (const prompt of enabledPrompts) {
          if (spentEstimate > maxCost) {
            aborted = "Run stopped: the configured cost limit was reached.";
            break;
          }
          const result = await runProvider(selection.provider, {
            prompt: prompt.prompt_text,
            model: selection.model,
            grounded: selection.grounded,
            market: diagnostic.market,
          });
          spentEstimate += result.estimatedCostUsd ?? 0;
          await storeRun(
            {
              diagnosticId: data.id,
              promptId: prompt.id,
              promptText: prompt.prompt_text,
              provider: selection.provider,
              model: result.model,
              modelVersion: result.modelVersion,
              groundingMode: result.groundingMode,
              status: result.status,
              rawText: result.rawText,
              rawPayload: result.rawPayload,
              citations: result.citations,
              inputTokens: result.inputTokens,
              outputTokens: result.outputTokens,
              searchCalls: result.searchCalls,
              estimatedCostUsd: result.estimatedCostUsd,
              actualCostUsd: result.actualCostUsd,
              error: result.error,
            },
            brands,
          );
          if (result.status === "success") {
            succeeded += 1;
            providerSuccess += 1;
          } else {
            failed += 1;
            providerFailed += 1;
          }
        }
        providerResults.push({
          provider: selection.provider,
          success: providerSuccess,
          failed: providerFailed,
        });
        if (aborted) break;
      }
    } catch (error) {
      aborted = safeMessage(error);
    }

    const expected = estimate.calls;
    const status =
      succeeded === 0 ? "failed" : succeeded === expected && !aborted ? "complete" : "partial";

    await db
      .from("diagnostics")
      .update({ status, completed_at: new Date().toISOString() })
      .eq("id", data.id);

    return {
      ok: succeeded > 0,
      status,
      expectedCalls: expected,
      succeeded,
      failed,
      providerResults,
      estimatedCostUsd: Math.round(spentEstimate * 1e6) / 1e6,
      aborted,
    };
  });

// ---------------------------------------------------------------------------
// Manual / import mode
// ---------------------------------------------------------------------------

export const importManualRun = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      adminKey: string;
      id: string;
      promptId: string | null;
      promptText: string;
      responseText: string;
      sourceUrls: string[];
      sourceLabel: string;
    }) =>
      z
        .object({
          adminKey: adminKeySchema,
          id: z.string().uuid(),
          promptId: z.string().uuid().nullable(),
          promptText: z.string().trim().min(3).max(2000),
          responseText: z.string().trim().min(1).max(80000),
          sourceUrls: z.array(z.string().trim().url().max(2000)).max(100),
          sourceLabel: z.string().trim().min(1).max(120),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const bundle = await loadDiagnosticBundle(data.id);
    const brands = brandConfigs(bundle.diagnostic, bundle.competitors);

    const runId = await storeRun(
      {
        diagnosticId: data.id,
        promptId: data.promptId,
        promptText: data.promptText,
        // Imported evidence is always labelled manual so it can never be mistaken
        // for an API-generated response.
        provider: "manual",
        model: `manual: ${data.sourceLabel}`,
        modelVersion: null,
        groundingMode: "manual",
        status: "success",
        rawText: data.responseText,
        rawPayload: { imported: true, sourceLabel: data.sourceLabel },
        citations: data.sourceUrls.map((url, index) => ({
          url,
          domain: domainFromUrl(url),
          title: null,
          position: index + 1,
        })),
        inputTokens: null,
        outputTokens: null,
        searchCalls: null,
        estimatedCostUsd: null,
        actualCostUsd: null,
        error: null,
        isManualImport: true,
      },
      brands,
    );

    return { ok: true as const, runId };
  });

// ---------------------------------------------------------------------------
// Findings
// ---------------------------------------------------------------------------

export const addFinding = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      adminKey: string;
      id: string;
      findingType: "observed" | "inferred";
      finding: string;
      supportingEvidence: string;
      runIds: string[];
    }) =>
      z
        .object({
          adminKey: adminKeySchema,
          id: z.string().uuid(),
          findingType: z.enum(["observed", "inferred"]),
          finding: z.string().trim().min(3).max(2000),
          supportingEvidence: z.string().trim().max(2000),
          runIds: z.array(z.string().uuid()).max(200),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();
    // Observed findings must reference stored evidence; inferences never become
    // observations automatically.
    if (data.findingType === "observed" && data.runIds.length === 0 && !data.supportingEvidence) {
      return {
        ok: false as const,
        error: "An observed finding needs supporting evidence or at least one referenced run.",
      };
    }
    const { error } = await db.from("diagnostic_findings").insert({
      diagnostic_id: data.id,
      finding_type: data.findingType,
      finding: data.finding,
      supporting_evidence: data.supportingEvidence || null,
      run_ids: data.runIds,
    });
    if (error) throw new Error(safeMessage(error));
    return { ok: true as const };
  });

export const deleteFinding = createServerFn({ method: "POST" })
  .inputValidator((data: { adminKey: string; findingId: string }) =>
    z.object({ adminKey: adminKeySchema, findingId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();
    const { error } = await db.from("diagnostic_findings").delete().eq("id", data.findingId);
    if (error) throw new Error(safeMessage(error));
    return { ok: true as const };
  });

// ---------------------------------------------------------------------------
// Historical monitoring
// ---------------------------------------------------------------------------

/** Clones a baseline into a new monitoring diagnostic. Nothing is overwritten. */
export const createMonitoringRerun = createServerFn({ method: "POST" })
  .inputValidator((data: { adminKey: string; baselineId: string }) =>
    z.object({ adminKey: adminKeySchema, baselineId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();
    const bundle = await loadDiagnosticBundle(data.baselineId);

    const { data: rows } = await db
      .from("diagnostics")
      .select("diagnostic_number")
      .order("created_at", { ascending: false })
      .limit(50);
    const highest = (rows ?? []).reduce((max, row) => {
      const match = /^BF-D(\d+)$/.exec(row.diagnostic_number ?? "");
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    const { data: created, error } = await db
      .from("diagnostics")
      .insert({
        diagnostic_number: `BF-D${String(highest + 1).padStart(3, "0")}`,
        company_name: bundle.diagnostic.company_name,
        website: bundle.diagnostic.website,
        market: bundle.diagnostic.market,
        diagnostic_type: "monitoring",
        status: "ready",
        target_aliases: bundle.diagnostic.target_aliases ?? [],
        provider_config: bundle.diagnostic.provider_config as never,
        max_estimated_cost_usd: bundle.diagnostic.max_estimated_cost_usd,
        max_provider_calls: bundle.diagnostic.max_provider_calls,
        baseline_diagnostic_id: bundle.diagnostic.baseline_diagnostic_id ?? data.baselineId,
      })
      .select("id, diagnostic_number")
      .single();
    if (error || !created) throw new Error(safeMessage(error));

    if (bundle.competitors.length) {
      await db.from("diagnostic_competitors").insert(
        bundle.competitors.map((competitor) => ({
          diagnostic_id: created.id,
          competitor_name: competitor.competitor_name,
          competitor_website: competitor.competitor_website,
          aliases: competitor.aliases ?? [],
        })),
      );
    }
    if (bundle.prompts.length) {
      await db.from("diagnostic_prompts").insert(
        bundle.prompts.map((prompt) => ({
          diagnostic_id: created.id,
          prompt_number: prompt.prompt_number,
          prompt_text: prompt.prompt_text,
          intent_type: prompt.intent_type,
          enabled: prompt.enabled,
        })),
      );
    }

    return { id: created.id, diagnosticNumber: created.diagnostic_number };
  });

function comparisonInput(bundle: Bundle): ComparisonInput {
  const scored = bundle.runs.filter((run) => !run.is_test_connection);
  return {
    label: `${bundle.diagnostic.diagnostic_number} (${new Date(bundle.diagnostic.created_at).toISOString().slice(0, 10)})`,
    metrics: metricsFromBundle(bundle),
    providers: scored.map((run) => run.provider),
    models: scored.map((run) => `${run.model_name}${run.model_version ? `@${run.model_version}` : ""}`),
    groundingModes: scored.map((run) => run.grounding_mode),
    prompts: bundle.prompts.filter((prompt) => prompt.enabled).map((prompt) => prompt.prompt_text),
  };
}

export const compareMonitoring = createServerFn({ method: "POST" })
  .inputValidator((data: { adminKey: string; baselineId: string; comparisonId: string }) =>
    z
      .object({
        adminKey: adminKeySchema,
        baselineId: z.string().uuid(),
        comparisonId: z.string().uuid(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();
    const [baseline, current] = await Promise.all([
      loadDiagnosticBundle(data.baselineId),
      loadDiagnosticBundle(data.comparisonId),
    ]);
    const result = compareDiagnostics(comparisonInput(baseline), comparisonInput(current));

    const { error } = await db.from("diagnostic_monitoring_comparisons").insert({
      baseline_diagnostic_id: data.baselineId,
      comparison_diagnostic_id: data.comparisonId,
      comparison_metadata: {
        baseline_number: baseline.diagnostic.diagnostic_number,
        comparison_number: current.diagnostic.diagnostic_number,
        comparability_flags: result.comparabilityFlags,
      } as never,
      comparison_results: result as never,
    });
    if (error) throw new Error(safeMessage(error));
    return { ok: true as const, result };
  });
