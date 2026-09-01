import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "duplicate" | "error">("idle");
  const [botField, setBotField] = useState("");
  const openedAt = useRef<number>(Date.now());

  const submit = useServerFn(submitSnapshotRequest);

  const set =
    (k: keyof Fields) =>
    (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({ ...prev, [k]: ev.target.value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (status === "sending") return;

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus("idle");
      requestAnimationFrame(() => {
        const first = document.querySelector<HTMLElement>("[aria-invalid='true']");
        first?.focus({ preventScroll: true });
        first?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      return;
    }

    setStatus("sending");
    try {
      const result = await submit({
        data: { ...values, botField, elapsedMs: Date.now() - openedAt.current },
      });
      if (result && "status" in result && result.status === "duplicate") {
        setStatus("duplicate");
        return;
      }
      setStatus("sent");
      setValues(initial);
    } catch {
      setStatus("error");
    }
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
            so expect to hear back within three business days.
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
                Six short fields. All are required except the last.
              </p>
            </div>

              <Field
                id="name"
                required
                label="Name"
                autoComplete="name"
                placeholder="Your name"
                value={values.name}
                onChange={set("name")}
                error={errors.name}
              />
              <Field
                id="email"
                required
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
                required
                label="Company"
                autoComplete="organization"
                placeholder="Company name"
                value={values.company}
                onChange={set("company")}
                error={errors.company}
              />
              <Field
                id="website"
                required
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
              <TextareaField
                id="sells"
                required
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

            <div aria-hidden="true" className="hidden">
              <label htmlFor="referral-code">Referral code</label>
              <input
                id="referral-code"
                name="referral-code"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={botField}
                onChange={(ev) => setBotField(ev.target.value)}
              />
            </div>



            <Button
              type="submit"
              variant="cta"
              size="xl"
              className="mt-1 w-full"
              disabled={status === "sending"}
              aria-busy={status === "sending"}
            >
              {status === "sending" ? "Sending..." : "Request My Free Snapshot"}
              {status === "sending" ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight aria-hidden="true" />
              )}
            </Button>

            <div role="status" aria-live="polite">
              {status === "sent" && (
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <p className="text-[0.875rem] leading-relaxed text-foreground">
                    Thanks. We will review your brand and buyer landscape and be in touch about your
                    AI Visibility Snapshot.
                  </p>
                </div>
              )}
              {status === "duplicate" && (
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <p className="text-[0.875rem] leading-relaxed text-foreground">
                    We already have a recent request from this email. If you need to update it, email
                    us at{" "}
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
              {status === "error" && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                  <p className="text-[0.875rem] leading-relaxed text-foreground">
                    Something went wrong sending your request. Please try again, or email us at{" "}
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
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              We use your details only to prepare your snapshot and contact you about it. See our{" "}
              <Link
                to="/privacy"
                className="underline decoration-hairline underline-offset-4 hover:text-foreground"
              >
                Privacy Notice
              </Link>
              .
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
        aria-required={props.required ? true : undefined}
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

function TextareaField({
  id,
  label,
  error,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  error?: string | undefined;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Textarea
        id={id}
        name={id}
        rows={2}
        aria-required={props.required ? true : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "mt-2 min-h-20 resize-y bg-background text-base sm:text-sm",
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
