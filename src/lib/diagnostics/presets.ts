// Reusable diagnostic configurations. Prompt counts are operational defaults and
// are freely editable per diagnostic. No prompt count is claimed to be
// statistically representative of all AI responses.

export type DiagnosticTypeId = "mini_signal" | "snapshot" | "deep_dive" | "monitoring";

export type PresetPrompt = { prompt_text: string; intent_type: string };

export const DIAGNOSTIC_TYPE_LABELS: Record<DiagnosticTypeId, string> = {
  mini_signal: "Mini signal",
  snapshot: "Free snapshot",
  deep_dive: "Deep dive",
  monitoring: "Monitoring",
};

export const DIAGNOSTIC_TYPE_PURPOSE: Record<DiagnosticTypeId, string> = {
  mini_signal: "Lightweight prospect evidence from a very small high-intent prompt set.",
  snapshot: "Lead-generation diagnostic: visibility summary, provider comparison, evidence highlights.",
  deep_dive:
    "Paid analysis: larger buyer-intent prompt set, competitor and citation analysis, observed and inferred findings.",
  monitoring: "Recurring rerun of a baseline prompt set, compared against previous measurements.",
};

function fill(template: string, category: string, market: string): string {
  return template.replaceAll("{category}", category).replaceAll("{market}", market || "your market");
}

const HIGH_INTENT = [
  "What is the best {category} for a small business?",
  "Which {category} would you recommend for a B2B company in {market}?",
  "What are the top alternatives to the leading {category} tools?",
  "Which {category} offers the best value for money?",
];

const COMPARISON = [
  "Compare the leading {category} options and say which you would choose.",
  "What are the strengths and weaknesses of the main {category} providers?",
  "Which {category} is easiest to implement for a team of ten people?",
  "Which {category} do reviewers rate highest in {market}?",
];

const DEEP = [
  "Shortlist three {category} providers for a growing company in {market} and justify each.",
  "Which {category} integrates best with existing sales and marketing systems?",
  "Which {category} suppliers are considered the most credible for enterprise buyers?",
  "What should a buyer in {market} avoid when choosing a {category}?",
  "Which {category} has the strongest reputation for support quality?",
  "Which {category} would you recommend if budget is the main constraint?",
  "Which {category} would you recommend if data security is the main constraint?",
  "Name the {category} providers most often recommended by industry analysts.",
  "Which {category} is the best fit for a services business in {market}?",
  "If a buyer only had time to evaluate two {category} options, which two should they pick?",
  "Which {category} providers are gaining the most attention this year?",
  "Which {category} would you not recommend, and why?",
];

/**
 * Generates a starting prompt set for a preset. Prompts are stored per
 * diagnostic and are fully editable before any provider call is made.
 */
export function presetPrompts(
  type: DiagnosticTypeId,
  category: string,
  market: string,
): PresetPrompt[] {
  const build = (templates: string[], intent: string) =>
    templates.map((template) => ({
      prompt_text: fill(template, category, market),
      intent_type: intent,
    }));

  if (type === "mini_signal") return build(HIGH_INTENT.slice(0, 4), "high_intent");
  if (type === "snapshot") {
    return [...build(HIGH_INTENT, "high_intent"), ...build(COMPARISON, "comparison")];
  }
  if (type === "deep_dive") {
    return [
      ...build(HIGH_INTENT, "high_intent"),
      ...build(COMPARISON, "comparison"),
      ...build(DEEP, "evaluation"),
    ];
  }
  // Monitoring diagnostics inherit the baseline prompt set verbatim.
  return [];
}
