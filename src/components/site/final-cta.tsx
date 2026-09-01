import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="rule-top bg-secondary/60">
      <div className="mx-auto w-full max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-24">
        <h2 className="text-[1.85rem] leading-tight sm:text-[2.6rem]">
          Your customers are already asking AI what to buy.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Find out whether it&rsquo;s sending them to you or your competitors.
        </p>
        <Button asChild variant="cta" size="xl" className="mt-9 w-full sm:w-auto">
          <a href="#snapshot">
            Get My Free AI Visibility Snapshot
            <ArrowRight aria-hidden="true" />
          </a>
        </Button>
        <p className="mt-5 text-sm text-muted-foreground">
          Focused buyer-journey analysis. No obligation. No guaranteed-ranking nonsense.
        </p>
      </div>
    </section>
  );
}
