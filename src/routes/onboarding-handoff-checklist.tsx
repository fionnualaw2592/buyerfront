import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { HandoffSampleLink } from "@/components/site/handoff-sample-link";
import { useFunnelAnalytics } from "@/components/site/funnel-analytics";

const title = "The signed-client handoff checklist | Buyerfront";
const description = "A free seven-step signed-client handoff checklist with ownership, ready conditions, a fictional website-project example and a printable blank worksheet.";

const rows = [
  ["Agreed scope", "Deliverables, exclusions and acceptance criteria", "Sales", "Delivery accepts scope"],
  ["Promises made", "Deadlines, dependencies and special commitments", "Sales", "Delivery confirms feasibility"],
  ["Named owner", "Delivery owner and client contact", "Operations", "Both know the next action"],
  ["Missing inputs", "Access, assets and data, with a due date and safe collection route", "Delivery", "Required inputs received or blocker recorded"],
  ["Kickoff", "Agenda, date and attendees", "Delivery", "Client confirms"],
  ["First milestone", "Observable result, date and acceptance criteria", "Delivery", "Client knows what happens first"],
  ["Escalation", "Blocked step, owner and review date", "Operations", "Overdue work has an agreed next step"],
];

export const Route = createFileRoute("/onboarding-handoff-checklist")({
  component: HandoffChecklist,
  head: () => ({
    meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://buyerfront.ie/onboarding-handoff-checklist" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://buyerfront.ie/onboarding-handoff-checklist" }],
  }),
});

function HandoffChecklist() {
  const { track } = useFunnelAnalytics();
  return (
    <div className="handoff-sample min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only">Skip to main content</a>
      <div className="sample-no-print"><SiteNav /></div>
      <main id="main" className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
        <header className="py-12 sm:py-16">
          <p className="eyebrow">Buyerfront / Free handoff sample</p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">The signed-client handoff checklist</h1>
          <p className="mt-5 font-medium text-signal">Illustrative template, not a client case study</p>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">A handoff is ready when delivery knows what was agreed, who owns the next step and what still needs to arrive.</p>
          <Button variant="outline" size="lg" className="sample-no-print mt-7" onClick={() => { track("sample_print"); window.print(); }}><Printer aria-hidden="true" /> Print / save PDF</Button>
        </header>
        <section aria-labelledby="checklist-heading" className="border-t border-hairline pt-8">
          <h2 id="checklist-heading" className="text-2xl sm:text-3xl">Seven checks before delivery starts</h2>
          <div className="sample-table-wrap mt-6 overflow-x-auto" role="region" aria-label="Seven-step handoff checklist" tabIndex={0}>
            <table className="sample-table w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">What to record, owner role and ready condition for each handoff item</caption>
              <thead className="bg-secondary"><tr>{["Item", "What to record", "Owner role", "Ready condition"].map(label => <th scope="col" key={label} className="border-b border-hairline px-4 py-4 font-medium">{label}</th>)}</tr></thead>
              <tbody>{rows.map(([item, record, owner, ready], index) => <tr key={item} className="border-b border-hairline"><th scope="row" className="px-4 py-5 align-top font-medium"><span className="mb-2 block font-mono text-xs text-signal">0{index + 1}</span>{item}</th><td className="px-4 py-5 align-top leading-relaxed">{record}</td><td className="px-4 py-5 align-top">{owner}</td><td className="px-4 py-5 align-top leading-relaxed">{ready}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
        <section aria-labelledby="example-heading" className="sample-example mt-12 border-l-2 border-signal pl-6">
          <p className="eyebrow">Clearly fictional worked example</p>
          <h2 id="example-heading" className="mt-3 text-2xl sm:text-3xl">A small agency website project</h2>
          <p className="mt-4 max-w-3xl leading-relaxed">Signed Monday. Delivery owner Alex. Client contact Sam. Brand assets are due Wednesday through the agreed secure collection route. Kickoff is planned for Thursday, conditional on access being available.</p>
          <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
            <div><dt className="font-medium">Record the agreement</dt><dd className="mt-2 leading-relaxed text-muted-foreground">Alex needs the agreed deliverables, exclusions and acceptance criteria, plus any deadlines or special commitments made by sales.</dd></div>
            <div><dt className="font-medium">Make the dependency visible</dt><dd className="mt-2 leading-relaxed text-muted-foreground">Analytics access is missing. Record it as a blocker, not as a completed input. Sam is the client contact for the access request.</dd></div>
            <div><dt className="font-medium">Escalate Wednesday</dt><dd className="mt-2 leading-relaxed text-muted-foreground">Missing analytics access is escalated Wednesday to the project owner. Record who owns the next action and when the blocker will be reviewed.</dd></div>
            <div><dt className="font-medium">Keep Thursday conditional</dt><dd className="mt-2 leading-relaxed text-muted-foreground">Alex and Sam still need to confirm the kickoff agenda, attendees and access readiness. The first milestone, date and acceptance criteria remain to be agreed. No delivery outcome is assumed.</dd></div>
          </dl>
        </section>
        <section aria-labelledby="worksheet-heading" className="sample-worksheet mt-12 border-t border-hairline pt-8">
          <h2 id="worksheet-heading" className="text-2xl sm:text-3xl">Your reusable handoff worksheet</h2>
          <p className="mt-3 text-sm text-muted-foreground">Project: ____________________ &nbsp; Signed date: ______________ &nbsp; Client contact: ____________________</p>
          <div className="sample-table-wrap mt-6 overflow-x-auto" role="region" aria-label="Blank reusable handoff worksheet" tabIndex={0}>
            <table className="sample-table sample-blank w-full min-w-[600px] table-fixed border-collapse text-left text-sm">
              <caption className="sr-only">Blank worksheet with seven rows for your own handoff</caption>
              <thead className="bg-secondary"><tr>{["Item", "Owner", "Due", "Status", "Next action"].map(label => <th scope="col" key={label} className="border border-hairline px-3 py-4 font-medium">{label}</th>)}</tr></thead>
              <tbody>{rows.map(([item]) => <tr key={item} className="h-16">{["Item", "Owner", "Due", "Status", "Next action"].map(column => <td key={column} className="border border-hairline px-3 py-3"><span className="sr-only">{item}: {column}, blank</span></td>)}</tr>)}</tbody>
            </table>
          </div>
        </section>
        <section className="sample-no-print mt-12 border-t border-hairline pt-8">
          <h2 className="text-2xl sm:text-3xl">Want help finding the gaps in your own handoff?</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">Share what happens after a client says yes. The free check is an initial review of the information you provide, not a guaranteed diagnosis.</p>
          <Button asChild variant="cta" size="xl" className="mt-6 w-full sm:w-auto"><HandoffSampleLink enquiry>Get My Free Onboarding Leak Check <ArrowRight aria-hidden="true" /></HandoffSampleLink></Button>
        </section>
      </main>
      <div className="sample-no-print"><SiteFooter /></div>
    </div>
  );
}