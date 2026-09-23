import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import onboardingDesk from "@/assets/onboarding-desk.jpg";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ink text-ink-foreground">
      <img src={onboardingDesk} width={1536} height={1024} alt="A client handoff across a work table" className="absolute inset-0 h-full w-full object-cover object-[58%_center] opacity-45 sm:object-center sm:opacity-65" fetchPriority="high" />
      <div className="absolute inset-0 bg-ink/35" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-6xl px-5 pt-16 pb-16 sm:px-8 sm:pt-24 sm:pb-24">
        <div className="max-w-3xl">
          <p className="eyebrow reveal flex items-center gap-3">
            <span aria-hidden="true" className="inline-block h-px w-6 shrink-0 bg-signal sm:w-8" />
            Buyerfront / Client onboarding
          </p>

          <h1 className="reveal mt-5 text-[1.95rem] leading-[1.12] text-balance sm:mt-6 sm:text-5xl sm:leading-[1.08] lg:text-[3.6rem]">
            You've won the client. Don't lose them in the handoff.
          </h1>

          <p className="reveal mt-5 max-w-2xl text-[0.975rem] leading-[1.7] text-ink-foreground/90 sm:mt-7 sm:text-lg sm:leading-[1.75]">
            Buyerfront fixes messy client onboarding, handoffs and follow-up so new customers get started faster and your team spends less time chasing, firefighting and figuring out what happens next.
          </p>

          <div className="reveal mt-7 sm:mt-9">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button asChild variant="cta" size="xl" className="group w-full sm:w-auto">
                <a href="#onboarding-check" data-onboarding-cta>
                  Get My Free Onboarding Leak Check
                  <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
              </Button>
            </div>

            <a href="#rescue-sprint" className="mt-5 inline-block text-sm text-ink-foreground underline decoration-signal underline-offset-4 hover:text-signal">See the €2,250 Rescue Sprint</a>
          </div>
        </div>
      </div>
    </section>
  );
}
