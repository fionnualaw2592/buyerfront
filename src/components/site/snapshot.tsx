import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const deliverables = [
  "Whether your brand makes the shortlist",
  "Which competitors appear instead",
  "Your biggest visibility gap",
  "An important source and evidence pattern",
  "The opportunity we would investigate first",
];

type Fields = {
  email: string;
  company: string;
  website: string;
  sells: string;
  competitor: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const initial: Fields = { email: "", company: "", website: "", sells: "", competitor: "" };

function validate(v: Fields): Errors {
  const e: Errors = {};
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
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof Fields) => (ev: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [k]: ev.target.value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = document.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    setSubmitting(true);
    // Submission handling is not connected yet. When a backend is added, send
    // `values` from here; nothing is stored or emailed at the moment.
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setDone(true);
  };

  return (
    <section id="snapshot" className="rule-top bg-ink text-ink-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <p className="eyebrow text-ink-foreground/55">Free AI Visibility Snapshot</p>
          <h2 className="mt-5 text-[1.75rem] leading-tight sm:text-[2.4rem]">
            See what your buyers may be seeing before they ever reach your website.
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-ink-foreground/70 sm:text-base">
            We test a focused sample of commercially relevant AI buying questions for your category,
            then send you a short read on what we observed.
          </p>

          <ul className="mt-8 space-y-3.5">
            {deliverables.map((d) => (
              <li key={d} className="flex items-start gap-3 text-sm sm:text-base">
                <Check className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
                <span className="text-ink-foreground/85">{d}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-card p-5 text-card-foreground shadow-lift sm:p-8">
          {done ? (
            <div role="status" aria-live="polite" className="py-6 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-signal/12 text-signal">
                <Check className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl sm:text-2xl">Request received</h3>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Thanks. We have your details for {values.company.trim()}. We will review the buying
                questions relevant to your category and reply to {values.email.trim()} with your
                snapshot.
              </p>
              <button
                type="button"
                onClick={() => {
                  setValues(initial);
                  setDone(false);
                }}
                className="mt-6 text-sm text-muted-foreground underline decoration-hairline underline-offset-4 hover:text-foreground"
              >
                Submit another brand
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <Field
                id="email"
                label="Work email"
                type="email"
                autoComplete="email"
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
                autoComplete="url"
                inputMode="url"
                placeholder="company.com"
                value={values.website}
                onChange={set("website")}
                error={errors.website}
              />
              <Field
                id="sells"
                label="What do you sell?"
                placeholder="For example: CRM software for field sales teams"
                value={values.sells}
                onChange={set("sells")}
                error={errors.sells}
              />
              <Field
                id="competitor"
                label="Main competitor"
                optional
                placeholder="Optional"
                value={values.competitor}
                onChange={set("competitor")}
              />

              <Button
                type="submit"
                variant="cta"
                size="xl"
                disabled={submitting}
                className="mt-2 w-full"
              >
                {submitting ? "Sending" : "Test My Brand Free"}
                {!submitting && <ArrowRight aria-hidden="true" />}
              </Button>
              <p className="text-xs leading-relaxed text-muted-foreground">
                We use your details only to prepare and send your snapshot.
              </p>
            </form>
          )}
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
        className={cn("mt-2 h-11 bg-background text-base sm:text-sm", error && "border-destructive", className)}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
