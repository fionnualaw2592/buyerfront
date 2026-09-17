import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { RevenueLeakageForm } from "@/components/site/revenue-leakage-form";

const title = "Revenue Leakage | Stop Losing the Enquiries You Already Have";
const description =
  "Buyerfront maps your journey from enquiry to customer and finds where enquiries, meetings and quotes fall out before they become revenue.";

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
      { property: "og:image", content: "https://buyerfront.ie/og-buyerfront.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://buyerfront.ie/og-buyerfront.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://buyerfront.ie/revenue-leakage" }],
  }),
});

const stages = [
  "Enquiry",
  "Contacted",
  "Qualified",
  "Appointment / Meeting",
  "Proposal / Quote",
  "Customer",
];

const leaks = [
  {
    title: "Slow follow-up",
    body: "An enquiry that waits hours or days has usually already spoken to someone else.",
  },
  {
    title: "Forgotten enquiries",
    body: "Messages arrive in shared inboxes, social accounts and voicemail, then quietly go cold.",
  },
  {
    title: "Poor qualification",
    body: "Time goes to enquiries that were never going to buy, while good ones wait.",
  },
  {
    title: "No-shows and cancellations",
    body: "Meetings get booked but never happen, and nobody owns the recovery.",
  },
  {
    title: "Stalled quotes and proposals",
    body: "Numbers are sent, silence follows, and the opportunity is written off rather than worked.",
  },
  {
    title: "Unclear ownership and hand-offs",
    body: "Between marketing, reception, sales and delivery, opportunities fall between people.",
  },
];

const snapshotIncludes = [
  "A simple map of your enquiry to customer journey as it is described and visible from outside",
  "The stages where opportunities are most likely to be lost",
  "The leak we would investigate first, and why it matters commercially",
  "What we would need to measure properly to confirm it",
];

function RevenueLeakagePage() {
  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-ink-foreground"
      >
        Skip to main content
      </a>
      <SiteNav />
      <main id="main">
        <section className="mx-auto w-full max-w-6xl px-5 pt-12 pb-14 sm:px-8 sm:pt-20 sm:pb-20">
          <p className="eyebrow">Revenue Leakage</p>
          <h1 className="mt-4 max-w-4xl text-[1.9rem] leading-[1.14] text-balance sm:text-[3rem] sm:leading-[1.08]">
            You might not need more leads. You might need to stop losing the ones you already have.
          </h1>
          <p className="mt-5 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            Buyerfront helps you find where enquiries, meetings, quotes and opportunities fall out
            before they become customers, so you can fix the losses you are already paying for.
          </p>
          <div className="mt-8">
            <a
              href="#revenue-leakage-snapshot"
              data-revenue-leakage-cta
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-ink px-5 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90"
            >
              Get My Free Revenue Leakage Snapshot
            </a>
          </div>
        </section>

        <section className="rule-top bg-secondary/60">
          <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
            <h2 className="text-[1.5rem] leading-snug sm:text-[2.1rem]">
              Most businesses only measure the top and the bottom.
            </h2>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
              Enquiries in, sales out. The losses happen in the middle, where nobody is watching.
            </p>

            <ol className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-6">
              {stages.map((stage, index) => (
                <li
                  key={stage}
                  className="rounded-lg border border-hairline bg-card p-4 shadow-card"
                >
                  <span className="font-mono text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
                    Stage {index + 1}
                  </span>
                  <p className="mt-2 text-[0.95rem] leading-snug text-foreground">{stage}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rule-top">
          <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
            <h2 className="text-[1.5rem] leading-snug sm:text-[2.1rem]">
              Where the money usually leaks
            </h2>
            <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
              {leaks.map((leak) => (
                <article
                  key={leak.title}
                  className="rounded-lg border border-hairline bg-card p-5 shadow-card"
                >
                  <h3 className="text-[1.05rem] leading-snug">{leak.title}</h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
                    {leak.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="revenue-leakage-snapshot" className="rule-top bg-ink text-ink-foreground">
          <div className="mx-auto grid w-full max-w-6xl gap-9 px-5 py-14 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div>
              <p className="eyebrow text-ink-foreground/55">Free Revenue Leakage Snapshot</p>
              <h2 className="mt-4 text-[1.65rem] leading-[1.18] text-balance sm:mt-5 sm:text-[2.4rem] sm:leading-tight">
                Before buying more leads, find the leak.
              </h2>
              <p className="mt-4 max-w-lg text-[0.925rem] leading-relaxed text-ink-foreground/70 sm:mt-6 sm:text-base">
                The snapshot is an initial diagnostic based on the information you give us and the
                parts of your buying journey we can see from the outside. It is not a full audit of
                your internal CRM data, because we do not have access to that yet. Every snapshot is
                reviewed by a human, so expect to hear back within three business days.
              </p>

              <ul className="mt-6 space-y-3 sm:mt-8 sm:space-y-3.5">
                {snapshotIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[0.925rem] sm:text-base">
                    <Check className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
                    <span className="min-w-0 text-ink-foreground/85">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-lg border border-ink-foreground/15 p-5">
                <p className="font-mono text-[0.6rem] tracking-[0.16em] text-ink-foreground/55 uppercase">
                  How the work progresses
                </p>
                <p className="mt-3 text-[0.925rem] leading-relaxed text-ink-foreground/80">
                  Free Revenue Leakage Snapshot, then a Revenue Leakage Deep Dive where the numbers
                  justify it, typically around €500 to €750 for the initial deep dive, then
                  implementation or workflow fixes only where the value is clear.
                </p>
              </div>
            </div>

            <RevenueLeakageForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
