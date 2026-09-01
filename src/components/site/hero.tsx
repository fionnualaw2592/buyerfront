import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const engines = ["ChatGPT", "Gemini", "Perplexity", "AI search"];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden="true" className="grid-field pointer-events-none absolute inset-0 h-full" />
      <div className="relative mx-auto w-full max-w-6xl px-5 pt-14 pb-16 sm:px-8 sm:pt-24 sm:pb-24">
        <div className="max-w-3xl">
          <p className="eyebrow reveal flex items-center gap-3">
            <span aria-hidden="true" className="inline-block h-px w-8 bg-signal" />
            AI Buyer Intelligence &amp; Growth
          </p>

          <h1 className="reveal mt-6 text-[2.1rem] leading-[1.08] sm:text-5xl lg:text-[3.6rem]">
            When customers ask AI what to buy, does your brand make the shortlist?
          </h1>

          <p className="reveal mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg sm:leading-[1.75]">
            Your customers are using ChatGPT, Gemini, Perplexity and AI search to research products,
            compare vendors and decide what to buy. <span className="text-foreground">[BRAND]</span>{" "}
            measures where your business appears in those buying journeys, identifies the competitors
            being recommended instead, and helps improve your chances of being discovered and
            considered.
          </p>

          <div className="reveal mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button asChild variant="cta" size="xl" className="w-full sm:w-auto">
              <a href="#snapshot">
                Get My Free AI Visibility Snapshot
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </Button>
            <a
              href="#proof"
              className="text-sm text-muted-foreground underline decoration-hairline underline-offset-4 transition-colors hover:text-foreground"
            >
              See what we measured
            </a>
          </div>

          <p className="reveal mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            No generic AI score. We test real buying questions relevant to your business.
          </p>
        </div>

        <ul className="reveal mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-hairline pt-6 sm:mt-20">
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
