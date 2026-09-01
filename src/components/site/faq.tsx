import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const faqs = [
  {
    q: "Is this SEO?",
    a: "It overlaps with SEO, but the problem is broader. Traditional SEO focuses heavily on visibility in search results. We examine how brands are represented, compared, cited and recommended inside AI-assisted buying journeys.",
  },
  {
    q: "Can you guarantee my company will be recommended by ChatGPT?",
    a: "No. AI outputs vary by engine, query and time, and they change as models and sources change. We improve the factors we can legitimately influence, such as your evidence base, positioning and content accessibility, rather than guaranteeing recommendations.",
  },
  {
    q: "Can't I use an AI visibility tool myself?",
    a: "Yes. Software can measure mentions, citations and competitors. Our work is focused on turning that information into commercial diagnosis, prioritised action and execution so your team doesn't have to build and operate an AI discovery programme internally.",
  },
  {
    q: "Which AI platforms do you measure?",
    a: "We use relevant AI discovery platforms and specialist measurement infrastructure depending on the project. Engine coverage can change as platforms and buyer behaviour evolve.",
  },
  {
    q: "Who is this for?",
    a: "Initially, B2B SaaS and high-value businesses where being excluded from a buyer's consideration set can mean losing a valuable customer.",
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
