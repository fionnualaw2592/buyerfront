import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const faqs = [
  {
    q: "What is AI visibility?",
    a: "AI visibility concerns how a brand is discovered, represented, cited or recommended when people use AI-powered tools during research and buying decisions. It covers whether you appear at all, how you are described and which sources shape those answers.",
  },
  {
    q: "Can you make my company rank #1 in ChatGPT?",
    a: "No. AI answers are probabilistic and change over time. Buyerfront does not guarantee rankings, citations or recommendations. We measure real buyer journeys, diagnose gaps and improve the signals and evidence surrounding the brand.",
  },
  {
    q: "Is this the same as SEO?",
    a: "No. There is overlap, but AI discovery introduces different buyer journeys, sources, citations, brand understanding and recommendation behaviour. Buyerfront focuses specifically on this emerging discovery layer.",
  },
  {
    q: "Which AI platforms do you analyse?",
    a: "We analyse relevant AI discovery experiences depending on the project, which can include ChatGPT, Google AI experiences and Perplexity. Coverage can change as platforms and buyer behaviour evolve.",
  },
  {
    q: "What happens after the free Snapshot?",
    a: "If there is a meaningful opportunity, you can choose to commission a deeper competitive analysis and prioritised improvement plan. Ongoing Growth support is also available where appropriate.",
  },
  {
    q: "Who is this for?",
    a: "B2B SaaS and other high-value businesses where being excluded from a buyer's consideration set can mean losing a valuable customer.",
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
