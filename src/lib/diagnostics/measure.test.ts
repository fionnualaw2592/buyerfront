import { describe, expect, test } from "bun:test";

import {
  calculateMetrics,
  compareDiagnostics,
  domainFromUrl,
  extractMentions,
  type BrandConfig,
  type MeasuredRun,
  type MentionRecord,
  type SourceRecord,
} from "./measure";
import { estimateDiagnosticCost } from "./models";

// Deterministic fixtures representing plausible normalised provider responses.
// No paid API call is involved anywhere in these tests.

const BRANDS: BrandConfig[] = [
  { canonical: "Salesflare", names: ["Salesflare", "Sales flare"], isTarget: true },
  { canonical: "Pipedrive", names: ["Pipedrive"], isTarget: false },
  { canonical: "HubSpot", names: ["HubSpot", "Hub Spot"], isTarget: false },
];

const OPENAI_FIXTURE = {
  text: "For small B2B teams, Pipedrive is usually the first recommendation. HubSpot is a strong alternative. Salesflare suits teams that want automatic data capture.",
  citations: [
    "https://www.g2.com/categories/crm",
    "https://blog.hubspot.com/sales/crm-comparison",
  ],
};

const GEMINI_FIXTURE = {
  text: "salesflare is often praised for automation. Pipedrive remains popular with sales-led teams.",
  citations: ["https://www.g2.com/products/pipedrive/reviews"],
};

const PERPLEXITY_FIXTURE = {
  text: "Top CRM options include Zoho, Freshsales and Insightly for budget-conscious buyers.",
  citations: ["https://www.capterra.com/crm-software/"],
};

describe("brand mention extraction", () => {
  test("detects target and competitors with positions, top 3 and first mention", () => {
    const mentions = extractMentions(OPENAI_FIXTURE.text, BRANDS);
    expect(mentions.map((mention) => mention.canonicalBrandName)).toEqual([
      "Pipedrive",
      "HubSpot",
      "Salesflare",
    ]);
    expect(mentions[0]?.isFirstMentioned).toBe(true);
    expect(mentions[0]?.isTop3).toBe(true);
    expect(mentions[2]?.mentionPosition).toBe(3);
    const target = mentions.find((mention) => mention.isTargetBrand);
    expect(target?.canonicalBrandName).toBe("Salesflare");
    expect(target?.recommendationContext).toContain("automatic data capture");
  });

  test("matches case variations and stores the detected string", () => {
    const mentions = extractMentions(GEMINI_FIXTURE.text, BRANDS);
    const target = mentions.find((mention) => mention.isTargetBrand);
    expect(target?.brandName).toBe("salesflare");
    expect(target?.canonicalBrandName).toBe("Salesflare");
    expect(target?.isFirstMentioned).toBe(true);
  });

  test("matches configured aliases", () => {
    const mentions = extractMentions("We like Sales flare for automation.", BRANDS);
    expect(mentions).toHaveLength(1);
    expect(mentions[0]?.canonicalBrandName).toBe("Salesflare");
    expect(mentions[0]?.brandName).toBe("Sales flare");
  });

  test("returns nothing when no configured brand appears", () => {
    expect(extractMentions(PERPLEXITY_FIXTURE.text, BRANDS)).toHaveLength(0);
  });

  test("does not create false positives from partial words", () => {
    const text = "Pipedriven marketing and Salesflarey are not real products. HubSpotting either.";
    expect(extractMentions(text, BRANDS)).toHaveLength(0);
  });

  test("position 4 and beyond is not counted as top 3", () => {
    const brands: BrandConfig[] = [
      ...BRANDS,
      { canonical: "Zoho", names: ["Zoho"], isTarget: false },
    ];
    const mentions = extractMentions(
      "Zoho, Pipedrive and HubSpot lead the market. Salesflare is a niche option.",
      brands,
    );
    const target = mentions.find((mention) => mention.isTargetBrand);
    expect(target?.mentionPosition).toBe(4);
    expect(target?.isTop3).toBe(false);
  });
});

describe("citation and source handling", () => {
  test("extracts source domains", () => {
    expect(OPENAI_FIXTURE.citations.map(domainFromUrl)).toEqual(["g2.com", "blog.hubspot.com"]);
    expect(domainFromUrl("not a url")).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------

const RUNS: MeasuredRun[] = [
  { id: "r1", provider: "openai", model: "gpt-4.1-mini", status: "success" },
  { id: "r2", provider: "google", model: "gemini-2.5-flash", status: "success" },
  { id: "r3", provider: "perplexity", model: "sonar", status: "success" },
  { id: "r4", provider: "openai", model: "gpt-4.1-mini", status: "failed" },
  { id: "r5", provider: "openai", model: "gpt-4.1-mini", status: "success", isTestConnection: true },
];

function mentionsFor(runId: string, text: string): MentionRecord[] {
  return extractMentions(text, BRANDS).map((mention) => ({
    runId,
    canonicalBrandName: mention.canonicalBrandName,
    mentionPosition: mention.mentionPosition,
    isTop3: mention.isTop3,
    isFirstMentioned: mention.isFirstMentioned,
  }));
}

const MENTIONS: MentionRecord[] = [
  ...mentionsFor("r1", OPENAI_FIXTURE.text),
  ...mentionsFor("r2", GEMINI_FIXTURE.text),
  ...mentionsFor("r3", PERPLEXITY_FIXTURE.text),
  // A mention attached to a failed run must be ignored entirely.
  ...mentionsFor("r4", OPENAI_FIXTURE.text),
];

const SOURCES: SourceRecord[] = [
  ...OPENAI_FIXTURE.citations.map((url) => ({
    runId: "r1",
    provider: "openai",
    url,
    domain: domainFromUrl(url),
  })),
  ...GEMINI_FIXTURE.citations.map((url) => ({
    runId: "r2",
    provider: "google",
    url,
    domain: domainFromUrl(url),
  })),
  ...PERPLEXITY_FIXTURE.citations.map((url) => ({
    runId: "r3",
    provider: "perplexity",
    url,
    domain: domainFromUrl(url),
  })),
  // Source from a failed run: excluded.
  {
    runId: "r4",
    provider: "openai",
    url: "https://example.com/x",
    domain: "example.com",
  },
];

describe("deterministic measurement", () => {
  const metrics = calculateMetrics(RUNS, MENTIONS, BRANDS, SOURCES);

  test("test-connection runs are excluded and failures are counted separately", () => {
    expect(metrics.measuredRuns).toBe(3);
    expect(metrics.failedRuns).toBe(1);
  });

  test("failed runs are excluded from denominators, not counted as absences", () => {
    const target = metrics.brands.find((brand) => brand.isTarget);
    expect(target?.measuredRuns).toBe(3);
    expect(target?.appearances).toBe(2);
    expect(target?.visibilityRate).toBe(0.6667);
    expect(target?.firstMentionedCount).toBe(1);
    expect(target?.averagePositionWhenMentioned).toBe(2);
  });

  test("competitor comparison", () => {
    const pipedrive = metrics.brands.find((brand) => brand.canonical === "Pipedrive");
    expect(pipedrive?.appearances).toBe(2);
    expect(pipedrive?.top3Appearances).toBe(2);
    expect(pipedrive?.firstMentionedCount).toBe(1);
    const hubspot = metrics.brands.find((brand) => brand.canonical === "HubSpot");
    expect(hubspot?.appearances).toBe(1);
  });

  test("provider level breakdown", () => {
    const target = metrics.brands.find((brand) => brand.isTarget);
    const openai = target?.byProvider.find((row) => row.provider === "openai");
    expect(openai?.measuredRuns).toBe(1);
    expect(openai?.appearances).toBe(1);
    const perplexity = target?.byProvider.find((row) => row.provider === "perplexity");
    expect(perplexity?.appearances).toBe(0);
    expect(perplexity?.visibilityRate).toBe(0);
  });

  test("cited domains and cross-provider overlap", () => {
    expect(metrics.totalCitations).toBe(4);
    const g2 = metrics.citedDomains.find((entry) => entry.domain === "g2.com");
    expect(g2?.frequency).toBe(2);
    expect(metrics.domainsSharedAcrossProviders.map((entry) => entry.domain)).toEqual(["g2.com"]);
    expect(metrics.citedDomains.some((entry) => entry.domain === "example.com")).toBe(false);
  });

  test("partial diagnostic: zero measured runs never divides by zero", () => {
    const empty = calculateMetrics(
      [{ id: "x", provider: "openai", model: "m", status: "failed" }],
      [],
      BRANDS,
    );
    expect(empty.measuredRuns).toBe(0);
    expect(empty.brands.every((brand) => brand.visibilityRate === 0)).toBe(true);
  });
});

describe("historical comparison", () => {
  test("reports deltas and flags comparability changes", () => {
    const baseline = calculateMetrics(RUNS, MENTIONS, BRANDS, SOURCES);
    const laterMentions = [
      ...mentionsFor("r1", "Salesflare is the top recommendation. Pipedrive follows."),
      ...mentionsFor("r2", GEMINI_FIXTURE.text),
      ...mentionsFor("r3", PERPLEXITY_FIXTURE.text),
    ];
    const current = calculateMetrics(RUNS, laterMentions, BRANDS, SOURCES);

    const result = compareDiagnostics(
      {
        label: "BF-D001",
        metrics: baseline,
        providers: ["openai", "google", "perplexity"],
        models: ["gpt-4.1-mini"],
        groundingModes: ["grounded"],
        prompts: ["p1"],
      },
      {
        label: "BF-D002",
        metrics: current,
        providers: ["openai", "google"],
        models: ["gpt-5"],
        groundingModes: ["ungrounded"],
        prompts: ["p1", "p2"],
      },
    );

    const target = result.brandDeltas.find((entry) => entry.isTarget);
    expect(target?.firstMentionedRate.delta).toBeGreaterThan(0);
    expect(result.comparabilityFlags).toHaveLength(4);
  });
});

describe("cost controls", () => {
  test("expected call count is prompts times providers", () => {
    const estimate = estimateDiagnosticCost(["a".repeat(80), "b".repeat(80)], [
      { provider: "openai", model: "gpt-4.1-mini", grounded: true },
      { provider: "google", model: "gemini-2.5-flash", grounded: true },
    ]);
    expect(estimate.calls).toBe(4);
    expect(estimate.perProvider).toHaveLength(2);
    expect(estimate.totalUsd).toBeGreaterThan(0);
  });

  test("unknown models are priced at the highest published rate so limits fail closed", () => {
    const known = estimateDiagnosticCost(["prompt"], [
      { provider: "openai", model: "gpt-4.1-mini", grounded: false },
    ]);
    const unknown = estimateDiagnosticCost(["prompt"], [
      { provider: "openai", model: "some-future-model", grounded: false },
    ]);
    expect(unknown.totalUsd).toBeGreaterThan(known.totalUsd);
  });
});
