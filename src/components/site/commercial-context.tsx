import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

type CommercialPath = {
  stage: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  featured: boolean;
  href?: string;
  to?: "/revenue-leakage";
};

const paths: CommercialPath[] = [
  {
    stage: "Before the customer reaches you",
    eyebrow: "AI Visibility",
    title: "Are you making the AI shortlist?",
    body: "When customers ask AI what to buy, which companies get mentioned, compared and recommended? We measure real buyer-intent AI journeys, then show where your visibility is being won or lost.",
    cta: "Explore AI Visibility",
    href: "#visibility-services",
    featured: true,
  },
  {
    stage: "After the enquiry arrives",
    eyebrow: "Revenue Leakage",
    title: "You may already have the customers you need.",
    body: "Enquiries, meetings and quotes quietly disappear before they ever become customers. We map your journey from enquiry to sale and find where opportunities you already paid for are falling out.",
    cta: "Explore Revenue Leakage",
    to: "/revenue-leakage",
    featured: true,
  },
  {
    stage: "Inside the business",
    eyebrow: "AI Workflows",
    title: "Where is manual work costing you time?",
    body: "Repetitive admin and disconnected tools consume capacity. We identify where AI or automation is genuinely worth doing, and prioritise by impact rather than novelty.",
    cta: "Explore AI Workflows",
    href: "#ai-workflows",
    featured: false,
  },
];

export function CommercialContext() {
  return (
    <section className="rule-top bg-secondary/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-24">
        <div className="max-w-3xl">
          <p className="eyebrow">One business, three connected areas</p>
          <h2 className="mt-4 text-[1.65rem] leading-[1.18] text-balance sm:mt-5 sm:text-[2.5rem] sm:leading-tight">
            Buyerfront finds where revenue is being lost, then fixes the highest-value gaps.
          </h2>
          <p className="mt-4 text-[0.975rem] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
            Revenue is lost in three places: before a customer ever reaches you, after an enquiry
            arrives, and inside the day to day running of the business.
          </p>
          <p className="mt-4 font-display text-xl leading-snug text-foreground sm:text-2xl">
            We measure first, then prescribe. Only the gaps worth money are worth fixing.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:mt-12 lg:grid-cols-3 lg:gap-5">
          {paths.map((path) => (
            <article
              key={path.eyebrow}
              className={
                path.featured
                  ? "flex flex-col rounded-lg border border-signal/50 bg-card p-5 shadow-lift sm:p-7"
                  : "flex flex-col rounded-lg border border-hairline bg-card p-5 shadow-card sm:p-7"
              }
            >
              <p className="font-mono text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
                {path.stage}
              </p>
              <p className={path.featured ? "eyebrow mt-3 text-signal" : "eyebrow mt-3"}>
                {path.eyebrow}
              </p>
              <h3 className="mt-3 text-[1.25rem] leading-snug sm:text-[1.5rem]">{path.title}</h3>
              <p className="mt-3 flex-1 text-[0.925rem] leading-relaxed text-muted-foreground">
                {path.body}
              </p>
              {path.to ? (
                <Link
                  to={path.to}
                  data-revenue-leakage-cta
                  className="mt-6 inline-flex min-h-11 items-center gap-2 self-start font-mono text-xs tracking-[0.12em] text-foreground uppercase transition-colors hover:text-signal"
                >
                  {path.cta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <a
                  href={path.href}
                  className="mt-6 inline-flex min-h-11 items-center gap-2 self-start font-mono text-xs tracking-[0.12em] text-foreground uppercase transition-colors hover:text-signal"
                >
                  {path.cta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
