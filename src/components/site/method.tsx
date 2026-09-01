const steps = [
  {
    n: "01",
    title: "Measure",
    body: "Establish how your brand currently appears across commercially relevant AI buying journeys.",
  },
  {
    n: "02",
    title: "Diagnose",
    body: "Investigate where competitors outperform you, what evidence supports those answers and which gaps appear realistically influenceable.",
  },
  {
    n: "03",
    title: "Improve",
    body: "Prioritise and execute improvements across areas that matter, which may include owned content, positioning, technical accessibility, comparisons, authority and third-party presence.",
  },
  {
    n: "04",
    title: "Monitor",
    body: "Repeat controlled measurements, track changes and continuously refine the programme.",
  },
];

export function Method() {
  return (
    <section id="method" className="rule-top bg-secondary/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-24">
        <p className="eyebrow">Method</p>
        <h2 className="mt-4 max-w-2xl text-[1.65rem] leading-[1.18] text-balance sm:mt-5 sm:text-[2.5rem] sm:leading-tight">
          Measure, diagnose, improve, monitor.
        </h2>

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

        <div className="mt-10 rounded-xl border border-hairline bg-card p-5 shadow-card sm:mt-14 sm:p-10">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <div>
              <p className="eyebrow">Integrity</p>
              <p className="mt-3 font-display text-[1.45rem] leading-[1.18] text-balance sm:mt-4 sm:text-[2.1rem] sm:leading-[1.15]">
                We don&rsquo;t promise to rank you #1 in ChatGPT.
              </p>
            </div>
            <p className="self-center text-[0.925rem] leading-relaxed text-muted-foreground sm:text-base">
              AI responses are probabilistic and no legitimate agency controls what an AI system
              recommends. We measure what happens, improve the signals we can legitimately influence
              and monitor the results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

