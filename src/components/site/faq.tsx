import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const faqs = [
  {
    q: "What do you mean by client onboarding?",
    a: "Everything between a client saying yes and being ready for delivery: the handoff from sales, kickoff, collecting information and assets, setting expectations and clarifying who owns the next step.",
  },
  {
    q: "Is this a CRM implementation?",
    a: "No. The Rescue Sprint looks at the journey, ownership and handoffs first. Tools may be part of the solution, but the goal is a clearer working process, not a software rollout for its own sake.",
  },
  {
    q: "Do I need to change my existing tools?",
    a: "Not necessarily. We start with the tools you already use and suggest changes or sensible automation only where they would help.",
  },
  {
    q: "What do I get in the €2,250 Rescue Sprint?",
    a: "A map of the current signed-client-to-active-client journey, the friction and ownership gaps we find, a redesigned onboarding approach, improvements to kickoff, communications, checklists and handoffs, and a prioritised implementation plan.",
  },
  {
    q: "Who is this for?",
    a: "Growing businesses with a messy or overly manual post-sale onboarding process. Recruitment agencies, B2B SaaS and implementation businesses, agencies and consultancies are examples, not limits.",
  },
  {
    q: "Can Buyerfront help implement the changes afterwards?",
    a: "Yes. The €2,250 Rescue Sprint covers the review, redesign and prioritised plan. Hands-on implementation is a separate service, scoped and agreed before work starts.",
  },
  {
    q: "Do I need to buy the Rescue Sprint or all the add-on services?",
    a: "No. Follow-on services are optional, and standalone work is possible when the scope is clear. You do not need to buy every service.",
  },
  {
    q: "What is included in ongoing support?",
    a: "Fractional onboarding and product ops starts from €1,500 per month for up to 12 hours, with agreed priorities, a weekly check-in and coordination of onboarding issues and process improvements. Additional hours are by agreement, not unlimited or 24/7 support.",
  },
  {
    q: "Are software subscriptions and usage fees included?",
    a: "No. Starting prices cover the scope shown for each service. Software subscriptions and usage fees are separate; final scope, timing and fees are agreed before work starts, with VAT added where applicable.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="rule-top">
      <div className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-24">
        <p className="eyebrow">Questions</p>
        <h2 className="mt-4 text-[1.65rem] leading-[1.18] text-balance sm:mt-5 sm:text-[2.5rem] sm:leading-tight">
          Straight answers before you ask.
        </h2>

        <Accordion type="single" collapsible className="mt-8 border-t border-hairline sm:mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="border-b border-border">
              <AccordionTrigger className="min-h-14 py-4 text-left font-display text-[1.0625rem] leading-snug tracking-tight hover:no-underline sm:py-5 sm:text-lg">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl pb-6 text-[0.925rem] leading-relaxed text-muted-foreground sm:text-base">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
