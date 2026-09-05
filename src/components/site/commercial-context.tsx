import { ArrowRight } from "lucide-react";

const services = [
  {
    eyebrow: "AI Visibility",
    title: "Are you making the AI shortlist?",
    body: "When prospective customers ask AI what to buy, which companies get mentioned, compared and recommended? Buyerfront measures real buyer-intent AI journeys, diagnoses where your visibility is being won or lost, and helps improve the evidence and information shaping how your business is discovered.",
    href: "#ai-visibility",
    cta: "Explore AI Visibility",
    featured: true,
  },
  {
    eyebrow: "AI Workflows",
    title: "Where is manual work costing you time and money?",
    body: "Repetitive processes, disconnected tools and manual administration can quietly consume hundreds of hours. Buyerfront identifies where AI can create meaningful operational improvements, prioritises opportunities by business impact and feasibility, and helps implement the ones worth doing.",
    href: "#ai-workflows",
    cta: "Explore AI Workflows",
    featured: false,
  },
];

export function CommercialContext() {
  return (
    <section className="rule-top bg-secondary/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-24">
        <div className="max-w-3xl">
          <p className="eyebrow">Two sides of the opportunity</p>
          <h2 className="mt-4 text-[1.65rem] leading-[1.18] text-balance sm:mt-5 sm:text-[2.5rem] sm:leading-tight">
            AI is changing both sides of your business.
          </h2>
          <p className="mt-4 text-[0.975rem] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
            Your customers are increasingly using AI to research, compare and evaluate companies. At
            the same time, your team has access to AI that can remove hours of repetitive work.
          </p>
          <p className="mt-4 font-display text-xl leading-snug text-foreground sm:text-2xl">
            The opportunity is not simply to &ldquo;use AI&rdquo;. It is to identify where AI can
            create measurable commercial advantage.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:mt-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-5">
          {services.map((service) => (
            <article
              key={service.eyebrow}
              className={service.featured
                ? "flex flex-col rounded-lg border border-signal/50 bg-card p-5 shadow-lift sm:p-8"
                : "flex flex-col rounded-lg border border-hairline bg-card p-5 shadow-card sm:p-8"}
            >
              <p className={service.featured ? "eyebrow text-signal" : "eyebrow"}>{service.eyebrow}</p>
              <h3 className="mt-4 text-[1.35rem] leading-snug sm:text-[1.7rem]">{service.title}</h3>
              <p className="mt-4 flex-1 text-[0.925rem] leading-relaxed text-muted-foreground sm:text-base">
                {service.body}
              </p>
              <a
                href={service.href}
                className="mt-6 inline-flex min-h-11 items-center gap-2 self-start font-mono text-xs tracking-[0.12em] text-foreground uppercase transition-colors hover:text-signal"
              >
                {service.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}