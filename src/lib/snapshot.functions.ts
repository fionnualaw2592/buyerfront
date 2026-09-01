import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FREE_EMAIL = /@(gmail|yahoo|hotmail|outlook|icloud|live|aol)\./i;

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().max(200).email().refine((v) => !FREE_EMAIL.test(v), {
    message: "Please use your work email address.",
  }),
  company: z.string().trim().min(1).max(160),
  website: z.string().trim().min(3).max(200),
  sells: z.string().trim().min(3).max(600),
  competitor: z.string().trim().max(600).optional().default(""),
  // Anti-spam: hidden field bots fill in, and how long the form was open.
  botField: z.string().max(200).optional().default(""),
  elapsedMs: z.number().int().nonnegative().max(1000 * 60 * 60 * 24),
});

export type SnapshotRequestInput = z.input<typeof schema>;

export const submitSnapshotRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, request }) => {
    // Silently accept obvious bot traffic so scrapers get no useful signal.
    if (data.botField.trim() !== "" || data.elapsedMs < 2500) {
      return { ok: true as const };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = data.email.toLowerCase();
    const competitor = data.competitor.trim();

    // Light rate limit: no more than 3 requests per address per hour.
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("snapshot_leads")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", since);

    if ((count ?? 0) >= 3) {
      return { ok: true as const };
    }

    const { data: lead, error } = await supabaseAdmin
      .from("snapshot_leads")
      .insert({
        name: data.name,
        email,
        company: data.company,
        website: data.website,
        sells: data.sells,
        competitor: competitor || null,
        user_agent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
      })
      .select("id, created_at")
      .single();

    if (error || !lead) {
      console.error("Failed to save snapshot lead", error?.message);
      throw new Error("save_failed");
    }

    // The lead is stored, so a notification failure is logged but never
    // reported to the visitor as a lost request.
    try {
      const { sendTemplateEmail } = await import("./email-templates/send-email");
      await sendTemplateEmail("snapshot-request", "hello@buyerfront.ie", {
        templateData: {
          name: data.name,
          email: data.email,
          company: data.company,
          website: data.website,
          sells: data.sells,
          competitor: competitor || "Not provided",
          submittedAt: new Date(lead.created_at).toUTCString(),
        },
        idempotencyKey: `snapshot-request-${lead.id}`,
        replyTo: data.email,
      });
      await supabaseAdmin.from("snapshot_leads").update({ notified: true }).eq("id", lead.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown notification error";
      console.error("Snapshot notification email failed", message);
      await supabaseAdmin
        .from("snapshot_leads")
        .update({ notify_error: message.slice(0, 500) })
        .eq("id", lead.id);
    }

    return { ok: true as const };
  });
