import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { RevenueLeakageForm } from "@/components/site/revenue-leakage-form";
import { OnboardingProblems, OnboardingJourney, RescueSprint, ImplementationSupport, OnboardingAudience, OnboardingProcess, OnboardingCheck } from "@/components/site/onboarding-sections";
import { Button } from "@/components/ui/button";

const title = "Client Onboarding Revenue Leakage | Buyerfront";
const description = "Stop losing momentum after the sale. Buyerfront fixes messy client onboarding, handoffs and follow-up with a focused Rescue Sprint.";

export const Route = createFileRoute("/revenue-leakage")({
  component: RevenueLeakagePage,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://buyerfront.ie/revenue-leakage" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://buyerfront.ie/revenue-leakage" }],
  }),
});

function RevenueLeakagePage() {
  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-ink-foreground">Skip to main content</a>
      <SiteNav />
      <main id="main">
        <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="eyebrow">Client onboarding / Revenue leakage</p>
          <h1 className="mt-4 max-w-4xl text-[1.9rem] leading-[1.14] text-balance sm:text-[3rem] sm:leading-[1.08]">Stop losing revenue after the sale.</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">You've won the client. Buyerfront helps close the gaps between signed, handed over and started, so the relationship begins on firmer ground.</p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Button asChild variant="cta" size="xl"><a href="#onboarding-check" data-onboarding-cta>Get My Free Onboarding Leak Check <ArrowRight aria-hidden="true" /></a></Button>
            <Link to="/" hash="rescue-sprint" className="text-sm underline decoration-signal underline-offset-4">See the €2,250 Rescue Sprint</Link>
          </div>
        </section>
        <OnboardingProblems />
        <OnboardingJourney />
        <RescueSprint />
        <ImplementationSupport />
        <OnboardingAudience />
        <section id="onboarding-check" className="rule-top scroll-mt-16 bg-ink text-ink-foreground">
          <div className="mx-auto grid w-full max-w-6xl gap-9 px-5 py-14 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <OnboardingCheck />
            <RevenueLeakageForm />
          </div>
        </section>
        <OnboardingProcess />
      </main>
      <SiteFooter />
    </div>
  );
}