// Deterministic brand mention extraction and visibility measurement.
//
// Everything in this module is pure and auditable. No AI call is involved in
// producing any metric: raw provider responses are the only input, and every
// extracted mention can be traced back to the stored response text.

export type BrandConfig = {
  /** Canonical brand identity used for grouping. */
  canonical: string;
  /** Names and aliases to match literally (case-insensitive). */
  names: string[];
  isTarget: boolean;
};

export type ExtractedMention = {
  /** The literal string detected in the response. */
  brandName: string;
  canonicalBrandName: string;
  /** 1-based rank of this brand's first appearance within the response. */
  mentionPosition: number;
  characterOffset: number;
  isTargetBrand: boolean;
  isCompetitor: boolean;
  isTop3: boolean;
  isFirstMentioned: boolean;
  recommendationContext: string | null;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Literal, boundary-anchored matching. Fuzzy matching is deliberately not used:
 * a brand is only counted when a configured name or alias appears as a whole
 * token, so partial words cannot silently create false positives.
 */
function firstIndexOf(haystack: string, needle: string): number {
  const trimmed = needle.trim();
  if (!trimmed) return -1;
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}])${escapeRegExp(trimmed)}(?![\\p{L}\\p{N}])`,
    "iu",
  );
  const match = pattern.exec(haystack);
  return match ? match.index : -1;
}

function sentenceAround(text: string, offset: number): string | null {
  if (offset < 0) return null;
  const start = Math.max(
    text.lastIndexOf(".", offset),
    text.lastIndexOf("\n", offset),
    text.lastIndexOf("!", offset),
    text.lastIndexOf("?", offset),
  );
  const rest = text.slice(offset);
  const endRelative = rest.search(/[.\n!?]/);
  const end = endRelative === -1 ? text.length : offset + endRelative + 1;
  const sentence = text.slice(start + 1, end).trim();
  return sentence ? sentence.slice(0, 500) : null;
}

/** Extracts one mention per configured brand that appears in the response. */
export function extractMentions(
  responseText: string,
  brands: BrandConfig[],
): ExtractedMention[] {
  if (!responseText) return [];

  const hits = brands
    .map((brand) => {
      let bestOffset = -1;
      let bestName = "";
      for (const name of brand.names) {
        const index = firstIndexOf(responseText, name);
        if (index !== -1 && (bestOffset === -1 || index < bestOffset)) {
          bestOffset = index;
          bestName = responseText.slice(index, index + name.trim().length);
        }
      }
      return { brand, offset: bestOffset, name: bestName };
    })
    .filter((hit) => hit.offset !== -1)
    .sort((a, b) => a.offset - b.offset);

  return hits.map((hit, index) => ({
    brandName: hit.name,
    canonicalBrandName: hit.brand.canonical,
    mentionPosition: index + 1,
    characterOffset: hit.offset,
    isTargetBrand: hit.brand.isTarget,
    isCompetitor: !hit.brand.isTarget,
    isTop3: index < 3,
    isFirstMentioned: index === 0,
    recommendationContext: sentenceAround(responseText, hit.offset),
  }));
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export type MeasuredRun = {
  id: string;
  provider: string;
  model: string;
  /** Only "success" runs enter any denominator. */
  status: "success" | "failed" | "skipped";
  isTestConnection?: boolean;
};

export type MentionRecord = {
  runId: string;
  canonicalBrandName: string;
  mentionPosition: number;
  isTop3: boolean;
  isFirstMentioned: boolean;
};

export type BrandMetrics = {
  canonical: string;
  isTarget: boolean;
  measuredRuns: number;
  appearances: number;
  visibilityRate: number;
  top3Appearances: number;
  top3Rate: number;
  firstMentionedCount: number;
  firstMentionedRate: number;
  averagePositionWhenMentioned: number | null;
  shareOfAppearances: number;
  byProvider: {
    provider: string;
    measuredRuns: number;
    appearances: number;
    visibilityRate: number;
    top3Appearances: number;
    firstMentionedCount: number;
    averagePositionWhenMentioned: number | null;
  }[];
};

export type SourceRecord = {
  runId: string;
  provider: string;
  url: string;
  domain: string;
};

export type DiagnosticMetrics = {
  measuredRuns: number;
  failedRuns: number;
  skippedRuns: number;
  runsByProvider: { provider: string; measured: number; failed: number }[];
  brands: BrandMetrics[];
  citedDomains: { domain: string; frequency: number; providers: string[] }[];
  domainsSharedAcrossProviders: { domain: string; providers: string[] }[];
  totalCitations: number;
};

function rate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 10000) / 10000;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

export function calculateMetrics(
  runs: MeasuredRun[],
  mentions: MentionRecord[],
  brands: BrandConfig[],
  sources: SourceRecord[] = [],
): DiagnosticMetrics {
  const scored = runs.filter((run) => !run.isTestConnection);
  const measured = scored.filter((run) => run.status === "success");
  const measuredIds = new Set(measured.map((run) => run.id));
  const runProvider = new Map(scored.map((run) => [run.id, run.provider]));

  // Failed and skipped runs are excluded from every denominator, so a provider
  // outage can never read as an absence of brand appearances.
  const validMentions = mentions.filter((mention) => measuredIds.has(mention.runId));

  const providers = Array.from(new Set(scored.map((run) => run.provider)));
  const runsByProvider = providers.map((provider) => ({
    provider,
    measured: measured.filter((run) => run.provider === provider).length,
    failed: scored.filter((run) => run.provider === provider && run.status === "failed").length,
  }));

  const totalAppearances = validMentions.length;

  const brandMetrics: BrandMetrics[] = brands.map((brand) => {
    const own = validMentions.filter((mention) => mention.canonicalBrandName === brand.canonical);
    return {
      canonical: brand.canonical,
      isTarget: brand.isTarget,
      measuredRuns: measured.length,
      appearances: own.length,
      visibilityRate: rate(own.length, measured.length),
      top3Appearances: own.filter((mention) => mention.isTop3).length,
      top3Rate: rate(own.filter((mention) => mention.isTop3).length, measured.length),
      firstMentionedCount: own.filter((mention) => mention.isFirstMentioned).length,
      firstMentionedRate: rate(
        own.filter((mention) => mention.isFirstMentioned).length,
        measured.length,
      ),
      averagePositionWhenMentioned: average(own.map((mention) => mention.mentionPosition)),
      shareOfAppearances: rate(own.length, totalAppearances),
      byProvider: providers.map((provider) => {
        const providerRuns = measured.filter((run) => run.provider === provider);
        const providerMentions = own.filter(
          (mention) => runProvider.get(mention.runId) === provider,
        );
        return {
          provider,
          measuredRuns: providerRuns.length,
          appearances: providerMentions.length,
          visibilityRate: rate(providerMentions.length, providerRuns.length),
          top3Appearances: providerMentions.filter((mention) => mention.isTop3).length,
          firstMentionedCount: providerMentions.filter((mention) => mention.isFirstMentioned).length,
          averagePositionWhenMentioned: average(
            providerMentions.map((mention) => mention.mentionPosition),
          ),
        };
      }),
    };
  });

  const validSources = sources.filter((source) => measuredIds.has(source.runId));
  const domainMap = new Map<string, { frequency: number; providers: Set<string> }>();
  for (const source of validSources) {
    const entry = domainMap.get(source.domain) ?? { frequency: 0, providers: new Set<string>() };
    entry.frequency += 1;
    entry.providers.add(source.provider);
    domainMap.set(source.domain, entry);
  }

  const citedDomains = Array.from(domainMap.entries())
    .map(([domain, entry]) => ({
      domain,
      frequency: entry.frequency,
      providers: Array.from(entry.providers).sort(),
    }))
    .sort((a, b) => b.frequency - a.frequency || a.domain.localeCompare(b.domain));

  return {
    measuredRuns: measured.length,
    failedRuns: scored.filter((run) => run.status === "failed").length,
    skippedRuns: scored.filter((run) => run.status === "skipped").length,
    runsByProvider,
    brands: brandMetrics,
    citedDomains,
    domainsSharedAcrossProviders: citedDomains.filter((entry) => entry.providers.length > 1),
    totalCitations: validSources.length,
  };
}

export function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "unknown";
  }
}

// ---------------------------------------------------------------------------
// Historical monitoring comparison
// ---------------------------------------------------------------------------

export type ComparisonInput = {
  label: string;
  metrics: DiagnosticMetrics;
  providers: string[];
  models: string[];
  groundingModes: string[];
  prompts: string[];
};

export type ComparisonResult = {
  baselineLabel: string;
  comparisonLabel: string;
  brandDeltas: {
    canonical: string;
    isTarget: boolean;
    visibilityRate: { baseline: number; current: number; delta: number };
    top3Rate: { baseline: number; current: number; delta: number };
    firstMentionedRate: { baseline: number; current: number; delta: number };
    averagePosition: { baseline: number | null; current: number | null; delta: number | null };
    appearances: { baseline: number; current: number; delta: number };
  }[];
  citationDeltas: { domain: string; baseline: number; current: number; delta: number }[];
  comparabilityFlags: string[];
};

function delta(a: number, b: number): number {
  return Math.round((b - a) * 10000) / 10000;
}

function setsDiffer(a: string[], b: string[]): boolean {
  const left = Array.from(new Set(a)).sort().join("|");
  const right = Array.from(new Set(b)).sort().join("|");
  return left !== right;
}

export function compareDiagnostics(
  baseline: ComparisonInput,
  current: ComparisonInput,
): ComparisonResult {
  const canonicals = Array.from(
    new Set([
      ...baseline.metrics.brands.map((brand) => brand.canonical),
      ...current.metrics.brands.map((brand) => brand.canonical),
    ]),
  );

  const brandDeltas = canonicals.map((canonical) => {
    const before = baseline.metrics.brands.find((brand) => brand.canonical === canonical);
    const after = current.metrics.brands.find((brand) => brand.canonical === canonical);
    const beforeAverage = before?.averagePositionWhenMentioned ?? null;
    const afterAverage = after?.averagePositionWhenMentioned ?? null;
    return {
      canonical,
      isTarget: Boolean(after?.isTarget ?? before?.isTarget),
      visibilityRate: {
        baseline: before?.visibilityRate ?? 0,
        current: after?.visibilityRate ?? 0,
        delta: delta(before?.visibilityRate ?? 0, after?.visibilityRate ?? 0),
      },
      top3Rate: {
        baseline: before?.top3Rate ?? 0,
        current: after?.top3Rate ?? 0,
        delta: delta(before?.top3Rate ?? 0, after?.top3Rate ?? 0),
      },
      firstMentionedRate: {
        baseline: before?.firstMentionedRate ?? 0,
        current: after?.firstMentionedRate ?? 0,
        delta: delta(before?.firstMentionedRate ?? 0, after?.firstMentionedRate ?? 0),
      },
      averagePosition: {
        baseline: beforeAverage,
        current: afterAverage,
        delta:
          beforeAverage === null || afterAverage === null
            ? null
            : delta(beforeAverage, afterAverage),
      },
      appearances: {
        baseline: before?.appearances ?? 0,
        current: after?.appearances ?? 0,
        delta: delta(before?.appearances ?? 0, after?.appearances ?? 0),
      },
    };
  });

  const domains = Array.from(
    new Set([
      ...baseline.metrics.citedDomains.map((entry) => entry.domain),
      ...current.metrics.citedDomains.map((entry) => entry.domain),
    ]),
  );
  const citationDeltas = domains
    .map((domain) => {
      const before = baseline.metrics.citedDomains.find((entry) => entry.domain === domain);
      const after = current.metrics.citedDomains.find((entry) => entry.domain === domain);
      return {
        domain,
        baseline: before?.frequency ?? 0,
        current: after?.frequency ?? 0,
        delta: (after?.frequency ?? 0) - (before?.frequency ?? 0),
      };
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const comparabilityFlags: string[] = [];
  if (setsDiffer(baseline.providers, current.providers)) {
    comparabilityFlags.push("Providers changed between these measurements.");
  }
  if (setsDiffer(baseline.models, current.models)) {
    comparabilityFlags.push("Models changed between these measurements.");
  }
  if (setsDiffer(baseline.groundingModes, current.groundingModes)) {
    comparabilityFlags.push("Grounding or search mode changed between these measurements.");
  }
  if (setsDiffer(baseline.prompts, current.prompts)) {
    comparabilityFlags.push("The prompt set changed between these measurements.");
  }

  return {
    baselineLabel: baseline.label,
    comparisonLabel: current.label,
    brandDeltas,
    citationDeltas,
    comparabilityFlags,
  };
}
