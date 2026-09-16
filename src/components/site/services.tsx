const tiers = [
  {
    n: "01",
    name: "Free AI Visibility Snapshot",
    body: "An initial view of how your company appears across commercially relevant AI buyer journeys, including a meaningful visibility opportunity or competitive finding.",
    cta: true,
  },
  {
    n: "02",
    name: "AI Visibility Deep Dive",
    body: "A paid competitive diagnosis covering a broader set of buyer-intent journeys, competitors, source and citation patterns, and prioritised improvement opportunities.",
  },
  {
    n: "03",
    name: "AI Visibility Growth",
    body: "Ongoing implementation, experimentation and monitoring designed to improve your company’s AI discovery landscape over time.",
  },
];

export function Services() {
  return (
    <section id="visibility-services" className="rule-top bg-secondary/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-24">
        <p className="eyebrow">AI Visibility offers</p>
        <h2 className="mt-4 max-w-2xl text-[1.65rem] leading-[1.18] text-balance sm:mt-5 sm:text-[2.5rem] sm:leading-tight">
          Start with a snapshot. Go deeper only if it is worth it.
        </h2>

        <div className="mt-6 flex flex-wrap items-center gap-3 font-display text-base sm:mt-8 sm:text-lg">
          <span>Free AI Visibility Snapshot</span>
          <span className="text-signal" aria-hidden="true">
            →
          </span>
          <span>AI Visibility Deep Dive</span>
          <span className="text-signal" aria-hidden="true">
            →
          </span>
          <span>AI Visibility Growth</span>
        </div>

        <ol className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 lg:grid-cols-3">
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
                  data-snapshot-cta
                  className="mt-5 inline-flex min-h-11 items-center gap-2 font-mono text-xs tracking-[0.12em] text-foreground uppercase transition-colors hover:text-signal"
                >
                  Get My Free AI Visibility Snapshot
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
