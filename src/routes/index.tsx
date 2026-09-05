import { createFileRoute } from "@tanstack/react-router";

import { SiteNav } from "@/components/site/site-nav";
import { Hero } from "@/components/site/hero";
import { CommercialContext } from "@/components/site/commercial-context";
import { Proof } from "@/components/site/proof";
import { Explanation } from "@/components/site/explanation";
import { Snapshot } from "@/components/site/snapshot";
import { Method } from "@/components/site/method";
import { Services } from "@/components/site/services";
import { Workflows } from "@/components/site/workflows";
import { Principles } from "@/components/site/principles";
import { Faq, faqs } from "@/components/site/faq";
import { FinalCta } from "@/components/site/final-cta";
import { SiteFooter } from "@/components/site/site-footer";

const title = "Buyerfront | AI Visibility & AI Workflow Transformation";
const description =
  "Buyerfront helps businesses improve how they are discovered by AI and identify where AI can remove costly manual work through practical, evidence-led AI strategy and implementation.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "https://buyerfront.ie/" },
      { property: "og:image", content: "https://buyerfront.ie/og-buyerfront.jpg" },
      { name: "twitter:image", content: "https://buyerfront.ie/og-buyerfront.jpg" },
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
        href="#snapshot"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-40 focus:z-60 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-ink-foreground"
      >
        Skip to snapshot request
      </a>
      <SiteNav />
      <main id="main">
        <Hero />
        <CommercialContext />
        <Method />
        <Proof />
        <Explanation />
        <Services />
        <Snapshot />
        <Workflows />
        <Principles />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
