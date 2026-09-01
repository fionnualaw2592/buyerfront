const prompts = [
  "What's the best [category] for a 50-person company?",
  "What are the best alternatives to [competitor]?",
  "Which [category] is best for [specific use case]?",
  "[Your brand] vs [competitor]: which is better for [buyer type]?",
];

const gaps = [
  {
    n: "01",
    title: "Discovery gap",
    body: "Does AI know your company belongs in the category at all?",
  },
  {
    n: "02",
    title: "Shortlist gap",
    body: "Does AI know your brand but recommend competitors instead?",
  },
  {
    n: "03",
    title: "Positioning gap",
    body: "Are you appearing for the buyer types and use cases you actually want to win?",
  },
  {
    n: "04",
    title: "Citation gap",
    body: "AI mentions you, but relies on other sources rather than your content.",
  },
  {
    n: "05",
    title: "Evidence ecosystem gap",
    body: "Competitors are reinforced by stronger independent sources, comparisons, reviews, editorial coverage or other credible evidence.",
  },
];

export function Explanation() {
  return (
    <section id="how-it-works" className="rule-top">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">The test</p>
        <h2 className="mt-5 max-w-2xl text-[1.75rem] leading-tight sm:text-[2.5rem]">
          What happens when we test your brand?
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          We ask the kinds of questions your prospective customers actually ask AI.
        </p>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {prompts.map((p) => (
            <li
              key={p}
              className="group flex items-start gap-3 rounded-lg border border-hairline bg-card px-5 py-4 shadow-card transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span aria-hidden="true" className="mt-0.5 font-mono text-sm text-signal">
                &gt;
              </span>
              <span className="font-mono text-[0.82rem] leading-relaxed tracking-tight text-foreground/90">
                {p}
              </span>
            </li>
          ))}
        </ul>

        <h3 className="mt-16 text-xl leading-snug sm:text-2xl">Five gaps we diagnose</h3>
        <ol className="mt-8 border-t border-hairline">
          {gaps.map((g) => (
            <li
              key={g.n}
              className="group grid gap-1.5 border-b border-border py-6 transition-colors sm:grid-cols-[4.5rem_14rem_1fr] sm:gap-6 sm:py-7 hover:bg-secondary/50"
            >
              <span className="font-mono text-xs text-signal sm:pt-1">{g.n}</span>
              <h4 className="text-base font-medium tracking-tight sm:text-lg">{g.title}</h4>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {g.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
