import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { attributionSchema, attributionToRow } from "./funnel.functions";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().max(200).email(),
  company: z.string().trim().min(1).max(160),
  website: z.string().trim().min(3).max(200),
  sells: z.string().trim().min(3).max(600),
  enquiryProcess: z.string().trim().min(10).max(1200),
  stuckPoints: z.string().trim().max(1200).optional().default(""),
  // Anti-spam: hidden field bots fill in, and how long the form was open.
  botField: z.string().max(200).optional().default(""),
  elapsedMs: z
    .number()
    .int()
    .nonnegative()
    .max(1000 * 60 * 60 * 24),
  attribution: attributionSchema,
});

export type RevenueLeakageRequestInput = z.input<typeof schema>;

export const submitRevenueLeakageRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    // Honeypot hits are silently accepted so scrapers get no useful signal.
    if (data.botField.trim() !== "") {
      return { ok: true as const, status: "received" as const };
    }

    if (data.elapsedMs < 2500) {
      return { ok: true as const, status: "duplicate" as const };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = data.email.toLowerCase();
    const stuckPoints = data.stuckPoints.trim();

    // The table ships with the pending Revenue Leakage migration, so the
    // generated database types do not describe it yet.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const leads = () => (supabaseAdmin as any).from("revenue_leakage_leads");

    // Light rate limit: no more than 3 requests per address per hour.
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await leads()
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", since);

    if ((count ?? 0) >= 3) {
      return { ok: true as const, status: "duplicate" as const };
    }

    const { data: lead, error } = await leads()
      .insert({
        name: data.name,
        email,
        company: data.company,
        website: data.website,
        sells: data.sells,
        enquiry_process: data.enquiryProcess,
        stuck_points: stuckPoints || null,
        ...attributionToRow(data.attribution),
      })
      .select("id, created_at")
      .single();

    if (error || !lead) {
      console.error("Failed to save revenue leakage lead", error?.message);
      throw new Error("save_failed");
    }

    try {
      const { error: analyticsError } = await supabaseAdmin.from("funnel_events").insert({
        event_name: "revenue_leakage_submission_success",
        ...attributionToRow(data.attribution),
      });
      if (analyticsError) throw analyticsError;
    } catch (analyticsError) {
      console.error(
        "Revenue leakage conversion measurement failed",
        analyticsError instanceof Error ? analyticsError.message : "unknown analytics error",
      );
    }

    // The lead is stored, so a notification failure is logged but never
    // reported to the visitor as a lost request.
    try {
      const { sendTemplateEmail } = await import("./email-templates/send-email");
      await sendTemplateEmail("revenue-leakage-request", "hello@buyerfront.ie", {
        templateData: {
          name: data.name,
          email: data.email,
          company: data.company,
          website: data.website,
          sells: data.sells,
          enquiryProcess: data.enquiryProcess,
          stuckPoints: stuckPoints || "Not provided",
          submittedAt: new Date(lead.created_at).toUTCString(),
        },
        idempotencyKey: `revenue-leakage-request-${lead.id}`,
        replyTo: data.email,
      });
      await leads().update({ notified: true }).eq("id", lead.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown notification error";
      console.error("Revenue leakage notification email failed", message);
      await leads()
        .update({ notify_error: message.slice(0, 500) })
        .eq("id", lead.id);
    }

    return { ok: true as const, status: "received" as const };
  });
