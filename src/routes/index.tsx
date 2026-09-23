import { createFileRoute } from "@tanstack/react-router";

import { SiteNav } from "@/components/site/site-nav";
import { Hero } from "@/components/site/hero";
import { OnboardingProblems, OnboardingJourney, RescueSprint, ImplementationSupport, OnboardingAudience, OnboardingProcess, OnboardingCheck } from "@/components/site/onboarding-sections";
import { RevenueLeakageForm } from "@/components/site/revenue-leakage-form";
import { Faq, faqs } from "@/components/site/faq";
import { FinalCta } from "@/components/site/final-cta";
import { SiteFooter } from "@/components/site/site-footer";

const title = "Buyerfront | Fix Client Onboarding Revenue Leaks";
const description =
  "Buyerfront helps growing businesses fix messy client onboarding, handoffs and follow-up with a focused Client Onboarding Rescue Sprint.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://buyerfront.ie/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://buyerfront.ie/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-ink-foreground"
      >
        Skip to main content
      </a>
      <a
        href="#onboarding-check"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-40 focus:z-60 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-ink-foreground"
      >
        Skip to Onboarding Leak Check
      </a>
      <SiteNav />
      <main id="main">
        <Hero />
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
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
