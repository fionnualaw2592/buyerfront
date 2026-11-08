import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const body = [
  "Hi Buyerfront,",
  "",
  "I'd like to ask about the €750 Agency Onboarding Setup Pilot.",
  "",
  "Agency website:",
  "Current tools (e.g. project management, forms, email):",
  "Where does onboarding usually get stuck?",
  "",
].join("\n");

export const pilotMailto = `mailto:hello@buyerfront.ie?subject=${encodeURIComponent("Agency onboarding pilot enquiry")}&body=${encodeURIComponent(body)}`;

const scope = [
  "One signed-client-to-kickoff workflow in your existing workspace",
  "One client intake form",
  "One internal handoff checklist",
  "Three client email templates: welcome, missing inputs and kickoff",
  "One straightforward reminder automation using supported integrations",
  "One 45-minute handover session and one consolidated revision",
];

export function AgencyPilot() {
  return (
    <section id="agency-pilot" className="rule-top scroll-mt-20">
      <div className="mx-auto grid w-full max-w-6xl gap-9 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <p className="eyebrow">For small marketing and web agencies</p>
          <h2 className="mt-4 text-[1.75rem] leading-tight text-balance sm:text-[2.5rem]">Agency Onboarding Setup Pilot</h2>
          <p className="mt-4 font-display text-[2rem] sm:text-[2.4rem]">€750</p>
          <p className="mt-1 text-sm text-muted-foreground">Project fee. VAT added if applicable. Software subscriptions excluded.</p>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            A tightly scoped setup of the steps between a signed client and kickoff, built in the tools you already use. The pilot is capped at ten delivery hours.
          </p>
          <Button asChild variant="cta" size="xl" className="mt-8 w-full sm:w-auto">
            <a href={pilotMailto}>Ask about the €750 pilot <ArrowRight aria-hidden="true" /></a>
          </Button>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">What the pilot includes</p>
          <ul className="mt-4 divide-y divide-hairline border-t border-hairline">
            {scope.map((item) => (
              <li key={item} className="flex gap-3 py-3.5 text-sm leading-relaxed sm:text-base">
                <Check className="mt-1 size-4 shrink-0 text-signal" aria-hidden="true" />{item}
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>Before any payment is accepted, we confirm tool compatibility, the exact scope and the access you can provide. Anything beyond this scope needs a separate agreed quote.</p>
            <p>We aim to complete the pilot within 10 business days of receiving the agreed inputs and access. This is a target, not a guarantee.</p>
            <p>The broader €2,250 Client Onboarding Rescue Sprint below is a separate service and is not required for the pilot.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
