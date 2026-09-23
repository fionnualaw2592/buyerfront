import { ArrowRight, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const symptoms = [
  "Clients take too long to get started",
  "Sales promises do not reach the delivery team",
  "Information and assets are missing at kickoff",
  "Nobody clearly owns the next step",
  "Teams repeatedly chase clients for the same things",
  "Onboarding lives across inboxes, spreadsheets and people's heads",
];

const stages = [
  { name: "Signed", detail: "The agreement is made, but the next step may not be clear." },
  { name: "Handoff", detail: "Commitments, context and ownership move from sales to delivery." },
  { name: "Kickoff", detail: "The client needs a clear plan, contacts and expectations." },
  { name: "Setup", detail: "Access, assets, information and approvals need collecting." },
  { name: "Active", detail: "Delivery can begin with fewer avoidable delays." },
];

const sprint = [
  "Map the current signed-client-to-active-client journey",
  "Find friction, ownership gaps, repeated chasing and handoff failures",
  "Redesign the onboarding journey around clear next steps",
  "Improve kickoff structure, customer communications, checklists, SOPs and handoffs",
  "Identify sensible automation opportunities",
  "Deliver a prioritised implementation plan",
];

const audiences = [
  {
    name: "Recruitment agencies",
    path: "Client brief and signoff → account handoff → recruiters → reporting and invoicing",
  },
  {
    name: "B2B SaaS & implementation businesses",
    path: "Signed customer → kickoff → access, data and setup → activation",
  },
  {
    name: "Agencies & consultancies",
    path: "Signed client → discovery → asset collection → delivery → approvals",
  },
];

const followOnServices = [
  {
    title: "Implementation support",
    price: "From €1,500 per project",
    description: "Turn an agreed onboarding plan into a working process in your existing tools.",
    scope: [
      "One onboarding journey in one existing workspace",
      "Intake, kickoff, checklist and handoff setup",
      "Up to three reusable templates or SOPs",
      "One team handover session and one revision round",
    ],
    boundary: "Complex integrations and data migrations are scoped separately.",
    cta: "Discuss implementation",
    subject: "Buyerfront implementation support enquiry",
  },
  {
    title: "Workflow automation & AI setup",
    price: "From €950 per project",
    description: "Reduce repetitive admin around intake, handoffs and follow-up.",
    scope: [
      "One defined workflow connecting up to two existing tools using supported integrations",
      "Testing, failure alerts, documentation and handover",
      "AI-assisted summaries or draft follow-ups where appropriate, with human review",
    ],
    boundary: "Additional workflows, custom API development and complex migrations are quoted separately.",
    cta: "Discuss automation",
    subject: "Buyerfront workflow automation enquiry",
  },
  {
    title: "Fractional onboarding & product ops",
    price: "From €1,500 per month",
    description: "Ongoing help keeping onboarding moving and improving the process.",
    scope: [
      "Up to 12 hours per month with agreed monthly priorities",
      "A weekly priorities check-in and onboarding issue/backlog coordination",
      "SOP improvements and customer-feedback handoffs to product and delivery",
    ],
    boundary: "Additional hours are by agreement. This is not unlimited or 24/7 support.",
    cta: "Discuss ongoing support",
    subject: "Buyerfront ongoing onboarding support enquiry",
  },
];

export function OnboardingProblems() {
  return (
    <section id="problem" className="rule-top bg-secondary/60 scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="eyebrow">The problem</p>
        <h2 className="mt-4 max-w-3xl text-[1.65rem] leading-[1.18] text-balance sm:text-[2.5rem] sm:leading-tight">
          You worked hard to win the client. What happens next should not put the relationship at risk.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          A signed deal is only the beginning. When the handoff is incomplete, delivery slows down and the client is left wondering what happens next.
        </p>
        <div className="mt-9 grid gap-x-10 sm:grid-cols-2 sm:gap-y-0">
          {symptoms.map((item, i) => (
            <div key={item} className="flex gap-4 border-t border-hairline py-4 sm:py-5">
              <span className="font-mono text-xs text-signal">0{i + 1}</span>
              <p className="text-[0.975rem] leading-snug">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OnboardingJourney() {
  return (
    <section className="rule-top">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="eyebrow">Signed client → active client</p>
        <h2 className="mt-4 max-w-3xl text-[1.65rem] leading-[1.18] text-balance sm:text-[2.5rem] sm:leading-tight">
          Where onboarding leaks revenue
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Delays and unclear handoffs can put a new relationship under strain before the work has properly begun. The first step is seeing where the journey breaks down.
        </p>
        <ol className="mt-9 grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-5">
          {stages.map((stage, i) => (
            <li key={stage.name} className="bg-card p-5 sm:p-6">
              <span className="font-mono text-xs text-signal">0{i + 1}</span>
              <h3 className="mt-4 text-xl">{stage.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{stage.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function RescueSprint() {
  return (
    <section id="rescue-sprint" className="rule-top bg-ink text-ink-foreground scroll-mt-20">
      <div className="mx-auto grid w-full max-w-6xl gap-9 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <p className="eyebrow text-signal">Flagship service</p>
          <h2 className="mt-4 text-[1.75rem] leading-tight text-balance sm:text-[2.7rem]">Client Onboarding Rescue Sprint</h2>
          <p className="mt-4 font-display text-[2rem] text-ink-foreground sm:text-[2.5rem]">€2,250</p>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-foreground/75">
            A focused service for growing businesses whose post-sale onboarding has become messy or overly manual.
          </p>
          <Button asChild variant="cta" size="xl" className="mt-8 w-full sm:w-auto">
            <a href="#onboarding-check" data-onboarding-cta>Get My Free Onboarding Leak Check <ArrowRight aria-hidden="true" /></a>
          </Button>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-foreground/60">What we work through</p>
          <ol className="mt-4 divide-y divide-ink-foreground/15 border-t border-ink-foreground/15">
            {sprint.map((item, i) => (
              <li key={item} className="flex gap-4 py-3.5 text-sm leading-relaxed sm:text-base">
                <span className="shrink-0 font-mono text-xs text-signal">0{i + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function ImplementationSupport() {
  return (
    <section id="implementation-support" className="rule-top scroll-mt-20 bg-secondary/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="eyebrow">Add-on services</p>
        <h2 className="mt-4 max-w-3xl text-[1.65rem] leading-tight text-balance sm:text-[2.5rem]">Put the plan into practice</h2>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
          The €2,250 Rescue Sprint covers review, redesign and a prioritised plan. Hands-on implementation is separately scoped. These services are optional, with no obligation to buy them all. Standalone work is possible when the scope is clear.
        </p>
        <div className="mt-9 grid gap-4 lg:grid-cols-3">
          {followOnServices.map((service, index) => (
            <article key={service.title} className="flex flex-col rounded-md border border-hairline bg-card p-5 sm:p-6">
              <span className="font-mono text-xs text-signal">0{index + 1}</span>
              <h3 className="mt-4 font-display text-[1.4rem] leading-tight">{service.title}</h3>
              <p className="mt-3 font-medium text-foreground">{service.price}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
              <p className="mt-6 border-t border-hairline pt-5 font-mono text-xs uppercase tracking-widest text-muted-foreground">Starting scope</p>
              <ul className="mt-4 space-y-3">
                {service.scope.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <Check className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{service.boundary}</p>
              <div className="mt-auto pt-7">
                <Button asChild variant="outline" className="w-full justify-between" size="lg">
                  <a href={`mailto:hello@buyerfront.ie?subject=${encodeURIComponent(service.subject)}`}>
                    {service.cta} <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-7 max-w-4xl text-sm leading-relaxed text-muted-foreground">
          Starting prices cover the scope shown. Final scope, timing and fees are agreed before work starts. Software subscriptions and usage fees are excluded; VAT is added where applicable.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-3 text-sm text-muted-foreground">
          <span>Prefer to write directly?</span>
          <a href="mailto:hello@buyerfront.ie" className="text-foreground underline decoration-hairline underline-offset-4 hover:text-signal">hello@buyerfront.ie</a>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <Link to="/ai-visibility" className="text-foreground underline decoration-hairline underline-offset-4 hover:text-signal">Also available: AI Visibility</Link>
        </div>
      </div>
    </section>
  );
}

export function OnboardingAudience() {
  return (
    <section id="who-its-for" className="rule-top scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="eyebrow">Who it is for</p>
        <h2 className="mt-4 max-w-3xl text-[1.65rem] leading-tight text-balance sm:text-[2.5rem]">Different businesses. The same costly handoff problem.</h2>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">These are starting points, not an exhaustive list. If clients get stuck between saying yes and getting started, the work is relevant.</p>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {audiences.map((item, i) => (
            <article key={item.name} className="rounded-lg border border-hairline bg-card p-5 shadow-card sm:p-6">
              <p className="font-mono text-xs text-signal">0{i + 1}</p>
              <h3 className="mt-3 text-xl">{item.name}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.path}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OnboardingProcess() {
  return (
    <section id="how-it-works" className="rule-top bg-secondary/60 scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="eyebrow">How Buyerfront works</p>
        <h2 className="mt-4 max-w-2xl text-[1.65rem] leading-tight text-balance sm:text-[2.5rem]">Understand the handoff. Then fix what matters.</h2>
        <div className="mt-9 grid gap-8 sm:grid-cols-3 sm:gap-10">
          {[
            ["01", "Review", "Tell us what happens after a client says yes. The free check starts with what you share, not an assumed diagnosis."],
            ["02", "Redesign", "The Rescue Sprint maps the actual journey and puts clearer ownership, steps and communication in place."],
            ["03", "Prioritise", "Leave with a practical implementation plan. Further help is available if it makes sense for your team."],
          ].map(([n, title, body]) => (
            <div key={n} className="border-t border-signal pt-5">
              <span className="font-mono text-xs text-signal">{n}</span>
              <h3 className="mt-3 text-xl">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OnboardingCheck() {
  return (
    <div className="max-w-lg">
      <p className="eyebrow text-ink-foreground/55">Free Onboarding Leak Check</p>
      <h2 className="mt-4 text-[1.65rem] leading-[1.18] text-balance sm:text-[2.4rem] sm:leading-tight">Find the friction between signed and started.</h2>
      <p className="mt-5 text-base leading-relaxed text-ink-foreground/75">
        This is an initial review of the onboarding process you describe and any relevant information you share. It is not a full audit of your internal systems, a guaranteed diagnosis or a promise of quantified revenue recovery.
      </p>
      <ul className="mt-7 space-y-4 text-sm leading-relaxed text-ink-foreground/85 sm:text-base">
        {["A first look at where handoffs or next steps may be unclear", "The area we would investigate first and what we would need to confirm it", "A practical next conversation if the Rescue Sprint looks relevant"].map((item) => (
          <li key={item} className="flex items-start gap-3"><Check className="mt-1 size-4 shrink-0 text-signal" aria-hidden="true" />{item}</li>
        ))}
      </ul>
      <p className="mt-7 text-sm text-ink-foreground/65">Every check is reviewed by a human. Expect to hear back within three business days.</p>
    </div>
  );
}