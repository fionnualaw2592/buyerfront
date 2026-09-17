import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFunnelAnalytics } from "@/components/site/funnel-analytics";
import { submitRevenueLeakageRequest } from "@/lib/revenue-leakage.functions";
import {
  emptyRevenueLeakageFields,
  validateRevenueLeakage,
  type RevenueLeakageErrors,
  type RevenueLeakageFields,
} from "@/lib/revenue-leakage-validation";

export function RevenueLeakageForm() {
  const [values, setValues] = useState<RevenueLeakageFields>(emptyRevenueLeakageFields);
  const [errors, setErrors] = useState<RevenueLeakageErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "duplicate" | "error">("idle");
  const [botField, setBotField] = useState("");
  const openedAt = useRef<number>(Date.now());
  const formStarted = useRef(false);

  const submit = useServerFn(submitRevenueLeakageRequest);
  const { attribution, track } = useFunnelAnalytics();

  const set =
    (key: keyof RevenueLeakageFields) =>
    (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [key]: ev.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (status === "sending") return;

    const found = validateRevenueLeakage(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      track("revenue_leakage_validation_failure");
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
        data: { ...values, botField, elapsedMs: Date.now() - openedAt.current, attribution },
      });
      if (result && "status" in result && result.status === "duplicate") {
        setStatus("duplicate");
        return;
      }
      setStatus("sent");
      setValues(emptyRevenueLeakageFields);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="rounded-xl bg-card p-5 text-card-foreground shadow-lift sm:p-8">
      <form
        onSubmit={onSubmit}
        onFocusCapture={() => {
          if (!formStarted.current) {
            formStarted.current = true;
            track("revenue_leakage_form_start");
          }
        }}
        noValidate
        className="space-y-4 sm:space-y-5"
      >
        <div>
          <h3 className="text-lg tracking-tight sm:text-xl">Request your snapshot</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Six short fields. All are required except the last.
          </p>
        </div>

        <Field
          id="rl-name"
          required
          label="Name"
          autoComplete="name"
          placeholder="Your name"
          value={values.name}
          onChange={set("name")}
          error={errors.name}
        />
        <Field
          id="rl-email"
          required
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="you@example.com"
          value={values.email}
          onChange={set("email")}
          error={errors.email}
        />
        <Field
          id="rl-company"
          required
          label="Company"
          autoComplete="organization"
          placeholder="Company name"
          value={values.company}
          onChange={set("company")}
          error={errors.company}
        />
        <Field
          id="rl-website"
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
          id="rl-sells"
          required
          label="What do you sell?"
          placeholder="Commercial fit-out projects for offices"
          value={values.sells}
          onChange={set("sells")}
          error={errors.sells}
        />
        <TextareaField
          id="rl-enquiry-process"
          required
          label="What happens after a new enquiry arrives?"
          placeholder="Who responds, how quickly, and what the next step usually is"
          value={values.enquiryProcess}
          onChange={set("enquiryProcess")}
          error={errors.enquiryProcess}
        />
        <TextareaField
          id="rl-stuck-points"
          label="Where do you think opportunities get stuck?"
          optional
          placeholder="Leave blank if unsure"
          value={values.stuckPoints}
          onChange={set("stuckPoints")}
        />

        <div aria-hidden="true" className="hidden">
          <label htmlFor="rl-referral-code">Referral code</label>
          <input
            id="rl-referral-code"
            name="rl-referral-code"
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
          {status === "sending" ? "Sending..." : "Get My Free Revenue Leakage Snapshot"}
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
                Thanks. We will review the journey you described and be in touch about your Revenue
                Leakage Snapshot.
              </p>
            </div>
          )}
          {status === "duplicate" && (
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-[0.875rem] leading-relaxed text-foreground">
                We already have a recent request from this email. If you need to update it, email us
                at{" "}
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
  optional,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
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
