import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden="true" className="grid-field pointer-events-none absolute inset-0 h-full opacity-60" />
      <div className="relative mx-auto w-full max-w-6xl px-5 pt-10 pb-12 sm:px-8 sm:pt-24 sm:pb-24">
        <div className="max-w-3xl">
          <p className="eyebrow reveal flex items-center gap-3">
            <span aria-hidden="true" className="inline-block h-px w-6 shrink-0 bg-signal sm:w-8" />
            AI Visibility + AI Workflow Transformation
          </p>

          <h1 className="reveal mt-5 text-[1.95rem] leading-[1.12] text-balance sm:mt-6 sm:text-5xl sm:leading-[1.08] lg:text-[3.6rem]">
            Make AI work for your business.
          </h1>

          <p className="reveal mt-5 max-w-2xl text-[0.975rem] leading-[1.7] text-muted-foreground sm:mt-7 sm:text-lg sm:leading-[1.75]">
            Buyerfront helps businesses win in an AI-driven market, from how customers discover and
            compare you to how work gets done inside your company.
          </p>

          <div className="reveal mt-7 sm:mt-9">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button asChild variant="cta" size="xl" className="group w-full sm:w-auto">
                <a href="#snapshot">
                   Check Your AI Visibility
                  <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
              </Button>
              <Button asChild variant="hairline" size="xl" className="w-full sm:w-auto">
                 <a href="#ai-workflows">Explore AI Workflow Opportunities</a>
              </Button>
            </div>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Practical AI strategy built around measurable business problems, not hype.
            </p>
          </div>
        </div>

        <div className="reveal mt-10 grid max-w-3xl gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:mt-20 sm:grid-cols-2">
          <a href="#ai-visibility" className="group bg-card p-4 transition-colors hover:bg-secondary sm:p-5">
            <span className="eyebrow text-signal">01 / External advantage</span>
            <span className="mt-2 block font-display text-lg">AI Visibility</span>
          </a>
          <a href="#ai-workflows" className="group bg-card p-4 transition-colors hover:bg-secondary sm:p-5">
            <span className="eyebrow">02 / Operational advantage</span>
            <span className="mt-2 block font-display text-lg">AI Workflows</span>
          </a>
        </div>
      </div>
    </section>
  );
}
