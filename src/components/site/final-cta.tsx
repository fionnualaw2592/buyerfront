import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="rule-top bg-secondary/60">
      <div className="mx-auto w-full max-w-3xl px-5 py-14 text-center sm:px-8 sm:py-24">
        <h2 className="text-[1.7rem] leading-[1.18] text-balance sm:text-[2.6rem] sm:leading-tight">
          Your customers are already asking AI what to buy.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[0.975rem] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
          Find out whether it&rsquo;s sending them to you or your competitors.
        </p>
        <Button asChild variant="cta" size="xl" className="mt-7 w-full sm:mt-9 sm:w-auto">
          <a href="#snapshot">
            Get Your Free AI Visibility Snapshot
            <ArrowRight aria-hidden="true" />
          </a>
        </Button>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:max-w-none">
          Focused buyer-journey analysis. No obligation. No guaranteed-ranking nonsense.
        </p>
      </div>
    </section>
  );
}
