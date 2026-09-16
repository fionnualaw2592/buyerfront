import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="grid-field pointer-events-none absolute inset-0 h-full opacity-60"
      />
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
            Buyerfront tests real AI buying journeys to show whether your brand appears, which
            competitors are recommended instead and the visibility gap to investigate first.
          </p>

          <div className="reveal mt-7 sm:mt-9">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button asChild variant="cta" size="xl" className="group w-full sm:w-auto">
                <a href="#snapshot" data-snapshot-cta>
                  Get My Free AI Visibility Snapshot
                  <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
              </Button>
            </div>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              No generic AI score. We test buying questions relevant to your business.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
