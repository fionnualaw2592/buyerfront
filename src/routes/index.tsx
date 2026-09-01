import { createFileRoute } from "@tanstack/react-router";

import { SiteNav } from "@/components/site/site-nav";
import { Hero } from "@/components/site/hero";
import { Proof } from "@/components/site/proof";
import { Explanation } from "@/components/site/explanation";
import { Snapshot } from "@/components/site/snapshot";
import { Method } from "@/components/site/method";
import { Faq, faqs } from "@/components/site/faq";
import { FinalCta } from "@/components/site/final-cta";
import { SiteFooter } from "@/components/site/site-footer";

const title = "AI Visibility for B2B Brands | AI Buyer Intelligence";
const description =
  "See whether AI recommends your brand when buyers research vendors. We measure AI search visibility, diagnose the gaps and improve what can be influenced. Free snapshot.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
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
        href="#snapshot"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-ink-foreground"
      >
        Skip to snapshot request
      </a>
      <SiteNav />
      <main>
        <Hero />
        <Proof />
        <Explanation />
        <Snapshot />
        <Method />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
