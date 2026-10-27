import { ArrowRight, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HandoffSampleLink } from "@/components/site/handoff-sample-link";

export function HandoffSampleSection() {
  return (
    <section className="rule-top bg-secondary/60">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-8 sm:py-20 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <p className="eyebrow">A practical starting point</p>
          <h2 className="mt-4 text-[1.65rem] leading-tight sm:text-[2.5rem]">The signed-client handoff checklist</h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">Scope, promises, ownership, inputs, kickoff, first milestone and escalation. Seven checks to make the next step clear before delivery begins.</p>
          <p className="mt-4 text-sm text-muted-foreground">Illustrative template, not a client case study</p>
          <Button asChild variant="outline" size="lg" className="mt-7">
            <HandoffSampleLink>View the free checklist <ArrowRight aria-hidden="true" /></HandoffSampleLink>
          </Button>
        </div>
        <div className="border-l-2 border-signal pl-6">
          <ClipboardCheck className="size-8 text-signal" aria-hidden="true" />
          <p className="mt-4 font-display text-2xl">What is agreed?<br />Who owns it?<br />When is it ready?</p>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">A fictional website-project example and a blank reusable worksheet. No email required.</p>
        </div>
      </div>
    </section>
  );
}