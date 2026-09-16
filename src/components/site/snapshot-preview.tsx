import { ArrowDown, Check, Search } from "lucide-react";

const engines = ["ChatGPT", "Gemini", "Perplexity"];

const findings = [
  {
    label: "Measured finding",
    title: "One brand dominated observed citation mentions",
    body: "HubSpot accounted for 38.8% of citation mentions in Buyerfront's CRM buyer-journey research, ahead of Salesforce, Pipedrive and Zoho CRM.",
  },
  {
    label: "Source observation",
    title: "Visibility extended beyond the brand's own website",
    body: "The observed evidence included independent publishers, communities, comparison content and other third-party sources.",
  },
];

export function SnapshotPreview() {
  return (
    <section className="rule-top" aria-labelledby="snapshot-preview-heading">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow text-signal">Buyerfront internal research / sample output</p>
          <h2
            id="snapshot-preview-heading"
            className="mt-4 text-[1.65rem] leading-[1.18] text-balance sm:mt-5 sm:text-[2.5rem] sm:leading-tight"
          >
            A focused answer, not another generic AI score.
          </h2>
          <p className="mt-4 text-[0.975rem] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
            Your free Snapshot turns a sample of real buyer questions into a concise view of where
            your brand appears, who is being recommended instead and what we would investigate
            first.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-hairline bg-card shadow-lift sm:mt-12">
          <div className="flex flex-col gap-5 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between sm:p-8">
            <div>
              <p className="font-mono text-[0.68rem] tracking-[0.15em] text-signal uppercase">
                Sample AI Visibility Snapshot
              </p>
              <h3 className="mt-3 text-xl leading-tight sm:text-2xl">CRM software buyer journey</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Illustrative format using Buyerfront internal research. This is not client work.
              </p>
            </div>
            <span className="self-start rounded-full border border-hairline bg-secondary px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.12em] uppercase">
              Redacted sample
            </span>
          </div>

          <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
            <div className="border-b border-border p-5 sm:p-8 lg:border-r lg:border-b-0">
              <p className="eyebrow">Test scope</p>
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-medium">AI discovery experiences reviewed</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {engines.map((engine) => (
                      <span
                        key={engine}
                        className="rounded-md border border-hairline bg-background px-3 py-2 text-sm"
                      >
                        {engine}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-secondary/70 p-4">
                  <div className="flex items-start gap-3">
                    <Search className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium">Fixed buyer-intent prompt set</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Category recommendations, alternatives, buyer-fit questions and competitor
                        comparisons relevant to the market.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Observed shortlist comparison</p>
                  <dl className="mt-3 space-y-2.5">
                    {[
                      ["HubSpot", "38.8%"],
                      ["Salesforce", "14.4%"],
                      ["Pipedrive", "13.7%"],
                      ["Zoho CRM", "11.5%"],
                    ].map(([brand, value]) => (
                      <div
                        key={brand}
                        className="flex items-baseline justify-between border-b border-border pb-2.5"
                      >
                        <dt className="text-sm text-muted-foreground">{brand}</dt>
                        <dd className="font-mono text-sm tabular-nums">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <p className="eyebrow">What the Snapshot separates</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {findings.map((finding) => (
                  <article
                    key={finding.label}
                    className="rounded-lg border border-hairline p-4 sm:p-5"
                  >
                    <p className="font-mono text-[0.65rem] tracking-[0.12em] text-signal uppercase">
                      {finding.label}
                    </p>
                    <h4 className="mt-3 text-lg leading-snug">{finding.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {finding.body}
                    </p>
                  </article>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-signal/35 bg-signal/5 p-4 sm:p-5">
                <p className="font-mono text-[0.65rem] tracking-[0.12em] text-signal uppercase">
                  Inference to investigate
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  A broader evidence ecosystem may be reinforcing the leading brand. The observed
                  association is a diagnostic lead, not proof of causation.
                </p>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium">Priority next checks</p>
                <ul className="mt-3 space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
                    Map the buyer questions where the target brand is absent from the shortlist.
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
                    Compare owned and third-party evidence supporting the visible competitors.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 border-t border-border bg-secondary/60 px-5 py-4 text-center text-sm text-muted-foreground">
            <ArrowDown className="size-4 text-signal" aria-hidden="true" />
            Request your own focused Snapshot below.
          </div>
        </div>
      </div>
    </section>
  );
}
