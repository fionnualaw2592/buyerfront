import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";

const stages = [
  {
    n: "01",
    title: "Discover",
    body: "Understand the current workflow, people involved, tools used, repetitive tasks, bottlenecks and business cost.",
  },
  {
    n: "02",
    title: "Prioritise",
    body: "Evaluate AI opportunities based on potential value, feasibility, risk, implementation effort and expected time saved.",
  },
  {
    n: "03",
    title: "Implement",
    body: "Design and implement practical AI-supported workflows using appropriate existing tools wherever possible.",
  },
  {
    n: "04",
    title: "Optimise",
    body: "Measure whether the workflow is actually delivering value and improve it where necessary.",
  },
];

const areas = [
  "Onboarding",
  "Internal knowledge",
  "Repetitive administration",
  "Document processing",
  "Reporting",
  "CRM workflows",
  "Customer operations",
  "Email and information triage",
];

const offers = [
  {
    n: "01",
    title: "AI Workflow Opportunity Audit",
    body: "Identify the workflows where AI could create the greatest operational return before investing in unnecessary tools or automation. The result is a prioritised shortlist of opportunities, not a generic list of AI ideas.",
  },
  {
    n: "02",
    title: "Implementation",
    body: "Where an opportunity has a credible business case, Buyerfront can help design and implement the improved workflow using appropriate AI, automation and existing business tools. We use what you already have where it is adequate.",
  },
  {
    n: "03",
    title: "Optimisation",
    body: "For workflows that benefit from continued support, Buyerfront can monitor performance, refine the process and identify further improvements. Ongoing work is only recommended where it genuinely adds value.",
  },
];

const workflowMailto =
  "mailto:hello@buyerfront.ie?subject=AI%20Workflow%20Opportunities&body=Name%3A%0ACompany%3A%0AWebsite%3A%0A%0AWorkflow%20I%27d%20like%20to%20improve%3A%0A";

export function Workflows() {
  return (
    <section id="ai-workflows" className="rule-top bg-ink text-ink-foreground">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-24">
        <div className="max-w-3xl">
          <p className="eyebrow text-ink-foreground/55">AI Workflow Transformation</p>
          <h2 className="mt-4 text-[1.7rem] leading-[1.18] text-balance sm:mt-5 sm:text-[2.6rem] sm:leading-tight">
            Find the work AI should be doing.
          </h2>
          <p className="mt-4 text-[0.975rem] leading-relaxed text-ink-foreground/70 sm:mt-5 sm:text-lg">
            Most businesses do not need more AI tools. They need to know where AI can remove
            meaningful work, reduce operational friction or improve an existing process.
          </p>
          <p className="mt-4 text-[0.975rem] leading-relaxed text-ink-foreground/70 sm:text-lg">
            Buyerfront analyses how work currently gets done, identifies the highest-value AI
            opportunities, and helps turn the strongest opportunities into practical workflows.
          </p>
        </div>

        <ol className="mt-9 grid gap-px overflow-hidden rounded-lg border border-ink-foreground/15 bg-ink-foreground/15 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((stage) => (
            <li key={stage.n} className="bg-ink p-5 sm:p-7">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-signal">{stage.n}</span>
                <h3 className="text-lg tracking-tight sm:text-xl">{stage.title}</h3>
              </div>
              <p className="mt-3 text-[0.925rem] leading-relaxed text-ink-foreground/65 sm:text-sm">
                {stage.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12 sm:mt-16">
          <p className="eyebrow text-ink-foreground/55">Commercial path</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 font-display text-lg sm:text-xl">
            <span>AI Workflow Opportunity Audit</span>
            <span className="text-signal" aria-hidden="true">→</span>
            <span>Implementation</span>
            <span className="text-signal" aria-hidden="true">→</span>
            <span>Optimisation</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {offers.map((offer) => (
            <article key={offer.n} className="rounded-lg border border-ink-foreground/15 p-5 sm:p-7">
              <span className="font-mono text-xs text-signal">{offer.n}</span>
              <h3 className="mt-3 text-xl leading-snug">{offer.title}</h3>
              <p className="mt-3 text-[0.925rem] leading-relaxed text-ink-foreground/65 sm:text-base">
                {offer.body}
              </p>
              {offer.n === "01" && (
                <div className="mt-5 border-t border-ink-foreground/15 pt-5">
                  <p className="font-mono text-[0.7rem] tracking-[0.12em] text-ink-foreground/50 uppercase">
                    Example areas, where relevant
                  </p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {areas.map((area) => (
                      <li key={area} className="flex items-start gap-2 text-sm text-ink-foreground/75">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-signal" aria-hidden="true" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>

        <Button asChild variant="cta" size="xl" className="mt-8 w-full sm:mt-10 sm:w-auto">
          <a href={workflowMailto}>
            Discuss Your Workflows
            <ArrowRight aria-hidden="true" />
          </a>
        </Button>
      </div>
    </section>
  );
}