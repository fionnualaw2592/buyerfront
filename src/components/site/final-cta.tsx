import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="rule-top bg-secondary/60">
      <div className="mx-auto w-full max-w-3xl px-5 py-14 text-center sm:px-8 sm:py-24">
        <h2 className="text-[1.7rem] leading-[1.18] text-balance sm:text-[2.6rem] sm:leading-tight">
          Where could AI create an advantage in your business?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[0.975rem] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
          Start with your external visibility or explore where AI could remove unnecessary work
          inside your operation.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:mt-9 sm:flex-row sm:items-center">
          <Button asChild variant="cta" size="xl" className="w-full sm:w-auto">
            <a href="#snapshot">
              Get a Free AI Visibility Snapshot
              <ArrowRight aria-hidden="true" />
            </a>
          </Button>
          <Button asChild variant="hairline" size="xl" className="w-full sm:w-auto">
            <a href="mailto:hello@buyerfront.ie?subject=AI%20Workflow%20Opportunities">Discuss AI Workflow Opportunities</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
