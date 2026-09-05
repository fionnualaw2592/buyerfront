const steps = [
  {
    n: "01",
    title: "Measure",
    body: "Capture genuine buyer-intent journeys across relevant AI systems and identify where your brand and competitors appear.",
  },
  {
    n: "02",
    title: "Diagnose",
    body: "Analyse competitive visibility, citations, source patterns, brand representation and potential evidence gaps.",
  },
  {
    n: "03",
    title: "Improve",
    body: "Prioritise legitimate improvements to content, authority, entity clarity, technical accessibility and third-party evidence.",
  },
  {
    n: "04",
    title: "Monitor",
    body: "Repeat controlled measurements to understand how visibility and competitive positioning change over time.",
  },
];

export function Method() {
  return (
    <section id="ai-visibility" className="rule-top">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-24">
        <p className="eyebrow">Flagship service / AI Visibility</p>
        <h2 className="mt-4 max-w-2xl text-[1.65rem] leading-[1.18] text-balance sm:mt-5 sm:text-[2.5rem] sm:leading-tight">
          AI Visibility Growth
        </h2>
        <p className="mt-4 max-w-3xl text-[0.975rem] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
          Understand whether your business appears when customers ask AI what to buy, and what may be
          helping competitors make the shortlist instead.
        </p>

        <ol className="mt-8 grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="bg-card p-5 sm:p-7">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-signal">{s.n}</span>
                <h3 className="text-lg tracking-tight sm:text-xl">{s.title}</h3>
              </div>
              <p className="mt-2.5 text-[0.925rem] leading-relaxed text-muted-foreground sm:mt-3 sm:text-sm">
                {s.body}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-8 max-w-3xl border-l-2 border-signal pl-4 text-sm leading-relaxed text-muted-foreground sm:mt-10 sm:pl-5 sm:text-base">
          AI responses are probabilistic and change over time. Buyerfront does not guarantee rankings,
          citations or recommendations.
        </p>
      </div>
    </section>
  );
}
