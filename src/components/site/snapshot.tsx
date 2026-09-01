import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitSnapshotRequest } from "@/lib/snapshot.functions";
import { cn } from "@/lib/utils";

const deliverables = [
  "Whether your brand makes the shortlist",
  "Which competitors appear instead",
  "Your biggest visibility gap",
  "An important source and evidence pattern",
  "The opportunity we would investigate first",
];

type Fields = {
  name: string;
  email: string;
  company: string;
  website: string;
  sells: string;
  competitor: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const initial: Fields = { name: "", email: "", company: "", website: "", sells: "", competitor: "" };

function validate(v: Fields): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Please add your name.";
  const email = v.email.trim();
  if (!email) e.email = "Please add your work email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "That email doesn't look valid.";
  else if (/@(gmail|yahoo|hotmail|outlook|icloud|live|aol)\./i.test(email))
    e.email = "Please use your work email address.";

  if (!v.company.trim()) e.company = "Please add your company name.";

  const site = v.website.trim();
  if (!site) e.website = "Please add your website.";
  else if (!/^([a-z]+:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(site)) e.website = "Enter a valid domain.";

  if (v.sells.trim().length < 3) e.sells = "A short description helps us pick the right questions.";

  return e;
}

export function Snapshot() {
  const [values, setValues] = useState<Fields>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [showNotice, setShowNotice] = useState(false);

  const set = (k: keyof Fields) => (ev: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [k]: ev.target.value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setShowNotice(false);
      requestAnimationFrame(() => {
        const first = document.querySelector<HTMLElement>("[aria-invalid='true']");
        first?.focus({ preventScroll: true });
        first?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      return;
    }

    // No submission destination is connected yet, so we never claim the request
    // was received. When a backend exists, send `values` from here.
    setShowNotice(true);
  };


  return (
    <section id="snapshot" className="rule-top bg-ink text-ink-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-9 px-5 py-14 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <p className="eyebrow text-ink-foreground/55">Free AI Visibility Snapshot</p>
          <h2 className="mt-4 text-[1.65rem] leading-[1.18] text-balance sm:mt-5 sm:text-[2.4rem] sm:leading-tight">
            See what your buyers may be seeing before they ever reach your website.
          </h2>
          <p className="mt-4 max-w-lg text-[0.925rem] leading-relaxed text-ink-foreground/70 sm:mt-6 sm:text-base">
            We test a focused sample of commercially relevant AI buying questions for your category,
            then send you a short read on what we observed. Every snapshot is reviewed by a human,
            so it is not instant.
          </p>

          <ul className="mt-6 space-y-3 sm:mt-8 sm:space-y-3.5">
            {deliverables.map((d) => (
              <li key={d} className="flex items-start gap-3 text-[0.925rem] sm:text-base">
                <Check className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
                <span className="min-w-0 text-ink-foreground/85">{d}</span>
              </li>
            ))}
          </ul>
        </div>


        <div className="rounded-xl bg-card p-5 text-card-foreground shadow-lift sm:p-8">
          <form onSubmit={onSubmit} noValidate className="space-y-4 sm:space-y-5">
            <div>
              <h3 className="text-lg tracking-tight sm:text-xl">Request your snapshot</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Six short fields. One is optional.
              </p>
            </div>

              <Field
                id="name"
                label="Name"
                autoComplete="name"
                placeholder="Your name"
                value={values.name}
                onChange={set("name")}
                error={errors.name}
              />
              <Field
                id="email"
                label="Work email"
                type="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="you@company.com"
                value={values.email}
                onChange={set("email")}
                error={errors.email}
              />
              <Field
                id="company"
                label="Company"
                autoComplete="organization"
                placeholder="Company name"
                value={values.company}
                onChange={set("company")}
                error={errors.company}
              />
              <Field
                id="website"
                label="Website"
                type="text"
                autoComplete="url"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="company.com"
                value={values.website}
                onChange={set("website")}
                error={errors.website}
              />
              <Field
                id="sells"
                label="What do you sell?"
                placeholder="CRM software for field sales teams"
                value={values.sells}
                onChange={set("sells")}
                error={errors.sells}
              />
              <Field
                id="competitor"
                label="Who do you consider your main competitors?"
                optional
                placeholder="Leave blank if unsure"
                value={values.competitor}
                onChange={set("competitor")}
              />

            <Button type="submit" variant="cta" size="xl" className="mt-1 w-full">
              Request My Free Snapshot
              <ArrowRight aria-hidden="true" />
            </Button>

            {showNotice && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-lg border border-border bg-muted/40 p-4"
              >
                <p className="text-[0.875rem] leading-relaxed text-foreground">
                  Online submissions are being connected. For now, email your snapshot request to{" "}
                  <a
                    href="mailto:hello@buyerfront.ie"
                    className="break-words underline decoration-hairline underline-offset-4"
                  >
                    hello@buyerfront.ie
                  </a>
                  .
                </p>
              </div>
            )}

            <p className="text-xs leading-relaxed text-muted-foreground">
              Your details are used only to prepare your snapshot once submitted through an active
              contact channel.
            </p>
          </form>
        </div>


      </div>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  optional,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string | undefined;
  optional?: boolean | undefined;
}) {
  return (
    <div>
      <Label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-muted-foreground">Optional</span>}
      </Label>
      <Input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "mt-2 h-12 bg-background text-base sm:h-11 sm:text-sm",
          error && "border-destructive",
          className,
        )}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>

  );
}
