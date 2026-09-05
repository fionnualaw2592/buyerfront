import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";

const title = "Privacy Notice | Buyerfront";
const description =
  "How Buyerfront collects, uses and retains information submitted through service enquiries, and how to exercise your data protection rights.";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://buyerfront.ie/privacy" },
      { property: "og:image", content: "https://buyerfront.ie/og-buyerfront.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://buyerfront.ie/og-buyerfront.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://buyerfront.ie/privacy" }],
  }),
});

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="text-[1.15rem] tracking-tight sm:text-[1.35rem]">{heading}</h2>
      <div className="mt-3 space-y-3 text-[0.95rem] leading-[1.75] text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function PrivacyPage() {
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
        <div className="mx-auto w-full max-w-3xl px-5 pt-12 pb-16 sm:px-8 sm:pt-20 sm:pb-24">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-4 text-[1.9rem] leading-[1.15] sm:text-[2.6rem]">Privacy Notice</h1>
          <p className="mt-5 text-[0.95rem] leading-[1.75] text-muted-foreground">
            This notice explains what personal data Buyerfront collects through this website, why we
            collect it and how long we keep it.
          </p>

          <Section heading="Who we are">
            <p>
              Buyerfront is a business based in Ireland and is the data controller for the personal
              data described here. You can reach us at{" "}
              <a
                href="mailto:hello@buyerfront.ie"
                className="text-foreground underline decoration-hairline underline-offset-4"
              >
                hello@buyerfront.ie
              </a>
              .
            </p>
          </Section>

          <Section heading="What we collect">
            <p>
              When you request a free AI Visibility Snapshot, we collect the details you enter in the
              form: your name, work email address, company name, website address, a short description
              of what your company sells and, optionally, the competitors you name. We also record
              the date and time of your enquiry. If you contact us by email about AI Workflow
              Transformation, we collect the contact and enquiry details you choose to send.
            </p>
            <p>
              We do not ask for special category data, and we do not use advertising or tracking
              cookies on this website.
            </p>
          </Section>

          <Section heading="Why we use it and on what legal basis">
            <p>
              We use these details to prepare your snapshot, discuss a workflow enquiry, contact you
              about the service you requested and respond to related questions. Our legal basis is
              legitimate interest in responding to a business enquiry you made to us. If we later
              send you unrelated marketing, we will ask for your consent first and you can withdraw
              it at any time.
            </p>
          </Section>

          <Section heading="Who has access to it">
            <p>
              Your details are handled by Buyerfront and by the service providers we need in order to
              operate this website, the enquiry form, our hosting and our email infrastructure. Those
              providers process the data on our instructions under contract. We do not sell your
              personal data.
            </p>
            <p>
              Some providers may process data outside the European Economic Area. Where that happens,
              transfers are covered by appropriate safeguards such as the European Commission's
              standard contractual clauses.
            </p>
          </Section>

          <Section heading="How long we keep it">
            <p>
              We keep service enquiries for 12 months, unless a customer relationship develops, in
              which case we retain the records for as long as that relationship requires, or unless
              a longer period is legally necessary. You can ask us to delete your enquiry sooner.
            </p>
          </Section>

          <Section heading="Your rights">
            <p>
              You have the right to access the personal data we hold about you, to have it corrected
              or erased, to restrict or object to our use of it, and to receive a copy in a portable
              format. Email{" "}
              <a
                href="mailto:hello@buyerfront.ie"
                className="text-foreground underline decoration-hairline underline-offset-4"
              >
                hello@buyerfront.ie
              </a>{" "}
              and we will respond within one month.
            </p>
            <p>
              If you are not satisfied with how we have handled your data, you can complain to the
              Irish Data Protection Commission at dataprotection.ie.
            </p>
          </Section>

          <Section heading="Changes to this notice">
            <p>
              If we change how we use personal data, we will update this page. This version was last
              updated in September 2026.
            </p>
          </Section>

          <p className="mt-12 text-sm">
            <Link
              to="/"
              className="text-muted-foreground underline decoration-hairline underline-offset-4 hover:text-foreground"
            >
              Back to home
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
