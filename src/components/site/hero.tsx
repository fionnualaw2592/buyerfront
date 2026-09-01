import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const engines = ["ChatGPT", "Gemini", "Perplexity", "AI search"];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden="true" className="grid-field pointer-events-none absolute inset-0 h-full opacity-60" />
      <div className="relative mx-auto w-full max-w-6xl px-5 pt-10 pb-12 sm:px-8 sm:pt-24 sm:pb-24">
        <div className="max-w-3xl">
          <p className="eyebrow reveal flex items-center gap-3">
            <span aria-hidden="true" className="inline-block h-px w-6 shrink-0 bg-signal sm:w-8" />
            AI Buyer Intelligence &amp; Growth
          </p>

          <h1 className="reveal mt-5 text-[1.95rem] leading-[1.12] text-balance sm:mt-6 sm:text-5xl sm:leading-[1.08] lg:text-[3.6rem]">
            When customers ask AI what to buy, does your brand make the shortlist?
          </h1>

          <p className="reveal mt-5 max-w-2xl text-[0.975rem] leading-[1.7] text-muted-foreground sm:mt-7 sm:text-lg sm:leading-[1.75]">
            Your customers are using ChatGPT, Gemini, Perplexity and AI search to research products,
            compare vendors and decide what to buy. <span className="text-foreground">[BRAND]</span>{" "}
            measures where your business appears in those buying journeys, identifies the competitors
            being recommended instead, and helps improve your chances of being discovered and
            considered.
          </p>

          <div className="reveal mt-7 sm:mt-9">
            <Button asChild variant="cta" size="xl" className="group w-full sm:w-auto">
              <a href="#snapshot">
                Get My Free AI Visibility Snapshot
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </Button>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              No generic AI score. We test real buying questions relevant to your business.
            </p>

            <a
              href="#proof"
              className="mt-5 inline-flex min-h-11 items-center gap-2 font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              See what we measured
              <span aria-hidden="true" className="text-signal">
                &darr;
              </span>
            </a>
          </div>
        </div>

        <ul className="reveal mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-hairline pt-5 sm:mt-20 sm:gap-x-8 sm:gap-y-3 sm:pt-6">

          <li className="eyebrow">Measured across</li>
          {engines.map((e) => (
            <li key={e} className="font-mono text-xs tracking-tight text-foreground/80">
              {e}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
