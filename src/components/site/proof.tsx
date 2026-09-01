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
  const max = shares[0].value;

  return (
    <section id="proof" className="rule-top bg-secondary/60">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">Proof</p>
        <h2 className="mt-5 max-w-2xl text-[1.75rem] leading-tight sm:text-[2.5rem]">
          AI is already choosing which brands buyers see.
        </h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <h3 className="text-xl leading-snug sm:text-2xl">
              We tested the AI buyer journey for CRM software.
            </h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Using a fixed set of buyer-intent questions, we recorded which brands were cited across
              AI answers. Four names absorbed most of the observed attention.
            </p>

            <dl className="mt-8 divide-y divide-border overflow-hidden rounded-lg border border-hairline bg-card shadow-card">
              {shares.map((s, i) => (
                <div key={s.brand} className="px-5 py-5 sm:px-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-sm font-medium tracking-tight sm:text-base">{s.brand}</dt>
                    <dd className="font-mono text-lg tabular-nums sm:text-xl">{s.value}%</dd>
                  </div>
                  <div
                    aria-hidden="true"
                    className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-accent"
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
              <div className="px-5 py-4 sm:px-6">
                <p className="font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase">
                  Share of observed citation mentions
                </p>
              </div>
            </dl>
          </div>

          <div className="flex flex-col">
            <h3 className="text-xl leading-snug sm:text-2xl">
              But HubSpot.com wasn&rsquo;t the whole story.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              HubSpot&rsquo;s brand appeared across a much wider evidence ecosystem, including
              independent publishers, communities, comparison content and other third-party sources.
            </p>

            <div className="mt-8 rounded-lg border border-hairline bg-card p-5 shadow-card sm:p-7">
              <p className="eyebrow">Where the evidence came from</p>
              <ul className="mt-5 space-y-4">
                {evidence.map((e, i) => (
                  <li key={e.label} className="flex gap-4">
                    <span className="mt-1 font-mono text-[0.7rem] text-signal">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block text-sm font-medium tracking-tight">{e.label}</span>
                      <span className="block text-sm text-muted-foreground">{e.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-border pt-5">
                <p className="font-display text-lg leading-snug sm:text-xl">
                  AI visibility isn&rsquo;t simply another Google ranking.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-12 max-w-3xl border-t border-hairline pt-6 text-xs leading-relaxed text-muted-foreground sm:text-[0.8rem]">
          <span className="eyebrow mr-2">Methodology</span>
          Observed September 2026 using a fixed set of CRM buyer-intent queries. AI responses are
          probabilistic and results can vary by engine, query and time. Citation patterns show
          observed associations, not proof of causation. This was an internal illustrative experiment,
          not client work.
        </p>
      </div>
    </section>
  );
}
