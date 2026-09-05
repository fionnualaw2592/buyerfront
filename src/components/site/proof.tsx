const shares = [
  { brand: "HubSpot", value: 38.8 },
  { brand: "Salesforce", value: 14.4 },
  { brand: "Pipedrive", value: 13.7 },
  { brand: "Zoho CRM", value: 11.5 },
];

const evidence = [
  { label: "Brand's own domain", note: "Owned content and product pages" },
  { label: "Independent publishers", note: "Editorial reviews and roundups" },
  { label: "Communities", note: "Practitioner discussion and Q&A" },
  { label: "Comparison content", note: "Vendor versus vendor pages" },
  { label: "Other third-party sources", note: "Directories, listings and analysis" },
];

export function Proof() {
  const max = shares[0]?.value ?? 100;

  return (
    <section id="proof" className="rule-top bg-secondary/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-24">
        <p className="eyebrow">AI Buyer Visibility Snapshot #001</p>
        <h2 className="mt-4 max-w-2xl text-[1.65rem] leading-[1.18] text-balance sm:mt-5 sm:text-[2.5rem] sm:leading-tight">
          What AI visibility actually looks like
        </h2>
        <p className="mt-4 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
          AI visibility is not one universal score. Different questions, competitors, sources and AI
          systems can produce different outcomes. Our research looks at the buyer journeys that
          actually matter to the business.
        </p>

        <div className="mt-10 grid gap-12 sm:mt-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <h3 className="text-lg leading-snug text-balance sm:text-2xl">
              We tested the AI buyer journey for CRM software.
            </h3>
            <p className="mt-3 max-w-md text-[0.925rem] leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
              Using a fixed set of buyer-intent questions, we recorded which brands were cited across
              AI answers. Four names absorbed most of the observed attention.
            </p>

            <p className="eyebrow mt-8">Share of observed citation mentions</p>
            <dl className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-hairline bg-card shadow-card">
              {shares.map((s, i) => (
                <div key={s.brand} className="px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="min-w-0 truncate text-[0.95rem] font-medium tracking-tight sm:text-base">
                      {s.brand}
                    </dt>
                    <dd className="shrink-0 font-mono text-xl tabular-nums sm:text-xl">{s.value}%</dd>
                  </div>
                  <div
                    aria-hidden="true"
                    className="mt-3 h-2 w-full overflow-hidden rounded-full bg-accent"
                  >
                    <div
                      className="bar-grow h-full rounded-full"
                      style={{
                        width: `${(s.value / max) * 100}%`,
                        animationDelay: `${i * 110}ms`,
                        backgroundColor:
                          i === 0 ? "var(--color-signal)" : "color-mix(in oklab, var(--color-ink) 55%, transparent)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col">
            <p className="eyebrow text-signal">The key insight</p>
            <h3 className="mt-3 border-l-2 border-signal pl-4 font-display text-[1.45rem] leading-[1.2] text-balance sm:pl-5 sm:text-[2rem]">
              But HubSpot.com wasn&rsquo;t the whole story.
            </h3>
            <p className="mt-4 text-[0.925rem] leading-relaxed text-muted-foreground sm:text-base">
              HubSpot&rsquo;s brand appeared across a much wider evidence ecosystem, including
              independent publishers, communities, comparison content and other third-party sources.
            </p>

            <div className="mt-7 rounded-lg border border-hairline bg-card p-4 shadow-card sm:mt-8 sm:p-7">
              <p className="eyebrow">Where the evidence came from</p>
              <ul className="mt-4 divide-y divide-border">
                {evidence.map((e, i) => (
                  <li key={e.label} className="flex gap-3 py-3 first:pt-0 last:pb-0 sm:gap-4">
                    <span className="mt-0.5 shrink-0 font-mono text-[0.7rem] text-signal">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.95rem] font-medium tracking-tight">
                        {e.label}
                      </span>
                      <span className="block text-sm text-muted-foreground">{e.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 border-t border-border pt-5">
                <p className="font-display text-base leading-snug text-balance sm:text-xl">
                  AI visibility isn&rsquo;t simply another Google ranking.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 max-w-3xl border-t border-hairline pt-5 text-[0.75rem] leading-relaxed text-muted-foreground sm:mt-12 sm:pt-6 sm:text-[0.8rem]">
          <span className="eyebrow mr-2 block sm:inline">Methodology</span>
          Observed September 2026 using a fixed set of CRM buyer-intent queries. AI responses are
          probabilistic and results can vary by engine, query and time. Citation patterns show
          observed associations, not proof of causation. This was an internal Buyerfront experiment,
          not client work.
        </p>
      </div>
    </section>
  );
}

