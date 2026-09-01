const tiers = [
  {
    n: "01",
    name: "Free AI Visibility Snapshot",
    body: "A concise first look at where your brand appears, where it may be missing and one or more commercially relevant opportunities worth investigating.",
    cta: true,
  },
  {
    n: "02",
    name: "AI Visibility Deep Dive",
    body: "A deeper competitive diagnosis covering buyer journeys, competitors, sources, visibility gaps and a prioritised improvement plan.",
  },
  {
    n: "03",
    name: "AI Visibility Growth",
    body: "Ongoing improvement, experimentation and monitoring focused on strengthening the evidence and visibility surrounding your brand over time.",
  },
];

export function Services() {
  return (
    <section id="services" className="rule-top">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-24">
        <p className="eyebrow">Services</p>
        <h2 className="mt-4 max-w-2xl text-[1.65rem] leading-[1.18] text-balance sm:mt-5 sm:text-[2.5rem] sm:leading-tight">
          Start with a snapshot. Go deeper only if it is worth it.
        </h2>

        <ol className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-3">
          {tiers.map((t) => (
            <li
              key={t.n}
              className="flex flex-col rounded-xl border border-hairline bg-card p-5 shadow-card sm:p-7"
            >
              <span className="font-mono text-xs text-signal">{t.n}</span>
              <h3 className="mt-3 text-lg leading-snug tracking-tight text-balance sm:text-xl">
                {t.name}
              </h3>
              <p className="mt-3 text-[0.925rem] leading-relaxed text-muted-foreground sm:text-base">
                {t.body}
              </p>
              {t.cta && (
                <a
                  href="#snapshot"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 font-mono text-xs tracking-[0.12em] text-foreground uppercase transition-colors hover:text-signal"
                >
                  Request yours
                  <span aria-hidden="true" className="text-signal">
                    &rarr;
                  </span>
                </a>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
