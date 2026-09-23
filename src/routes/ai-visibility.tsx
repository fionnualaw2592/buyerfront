import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Snapshot } from "@/components/site/snapshot";
import { Method } from "@/components/site/method";
import { Proof } from "@/components/site/proof";
import { Explanation } from "@/components/site/explanation";
import { Services } from "@/components/site/services";
import { SnapshotPreview } from "@/components/site/snapshot-preview";

const title = "AI Visibility | Buyerfront";
const description = "Explore Buyerfront's AI Visibility service and request a free AI Visibility Snapshot.";

export const Route = createFileRoute("/ai-visibility")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://buyerfront.ie/ai-visibility" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://buyerfront.ie/ai-visibility" }],
  }),
  component: AiVisibilityPage,
});

function AiVisibilityPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main>
        <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="eyebrow">AI Visibility</p>
          <h1 className="mt-4 max-w-4xl text-[1.9rem] leading-tight text-balance sm:text-[3rem]">When customers ask AI what to buy, does your brand make the shortlist?</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">Buyerfront tests real AI buying journeys to show whether your brand appears, which competitors are recommended instead and the visibility gap to investigate first.</p>
          <a href="#snapshot" data-snapshot-cta className="mt-7 inline-flex min-h-12 items-center rounded-md bg-ink px-5 text-sm font-medium text-ink-foreground hover:opacity-90">Get My Free AI Visibility Snapshot</a>
        </section>
        <Method />
        <Proof />
        <Explanation />
        <Services />
        <SnapshotPreview />
        <Snapshot />
      </main>
      <SiteFooter />
    </div>
  );
}