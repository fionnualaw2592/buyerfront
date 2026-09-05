const principles = [
  { title: "Commercial first", body: "Start with the business problem, not the AI tool." },
  {
    title: "Evidence over hype",
    body: "Measure what is happening before recommending what should change.",
  },
  {
    title: "Practical implementation",
    body: "Use AI and automation where they meaningfully improve an existing process.",
  },
  {
    title: "Honest measurement",
    body: "Distinguish observed results from inference and never guarantee outcomes we cannot control.",
  },
];

export function Principles() {
  return (
    <section id="how-we-work" className="rule-top">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-24">
        <p className="eyebrow">How we work</p>
        <h2 className="mt-4 max-w-2xl text-[1.65rem] leading-[1.18] text-balance sm:mt-5 sm:text-[2.5rem] sm:leading-tight">
          Measure before we prescribe.
        </h2>

        <ol className="mt-8 grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle, index) => (
            <li key={principle.title} className="bg-card p-5 sm:p-7">
              <span className="font-mono text-xs text-signal">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg tracking-tight sm:text-xl">{principle.title}</h3>
              <p className="mt-2.5 text-[0.925rem] leading-relaxed text-muted-foreground sm:text-sm">
                {principle.body}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-8 max-w-3xl border-l-2 border-signal pl-4 font-display text-xl leading-snug text-balance sm:mt-10 sm:pl-5 sm:text-2xl">
          No generic AI transformation decks. No automation for automation&rsquo;s sake. No promises of
          guaranteed ChatGPT rankings. Just commercially useful AI work grounded in evidence.
        </p>

        <div id="who-we-work-with" className="mt-12 border-t border-hairline pt-10 sm:mt-16 sm:pt-14">
          <p className="eyebrow">Who we work with</p>
          <h3 className="mt-4 max-w-2xl text-[1.45rem] leading-[1.2] text-balance sm:text-[2rem]">
            Built for businesses where improvement is worth something.
          </h3>
          <p className="mt-4 max-w-3xl text-[0.975rem] leading-relaxed text-muted-foreground sm:text-lg">
            Buyerfront is particularly suited to B2B SaaS and other high-value businesses where
            better discovery, stronger buyer visibility or improved operational efficiency can
            create meaningful commercial value.
          </p>
        </div>
      </div>
    </section>
  );
}