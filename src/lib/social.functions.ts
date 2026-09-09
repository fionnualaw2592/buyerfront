import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Internal social publishing pipeline.
//
// Access model: this is an internal-only surface with no public UI. Every
// function requires the shared admin key (BUYERFRONT_ADMIN_KEY) which is
// compared server-side with a timing-safe digest. The Buffer credential is
// never returned, logged, or sent to the browser.

const adminKeySchema = z.string().min(16).max(400);

async function assertAdmin(adminKey: string): Promise<void> {
  const secret = process.env["BUYERFRONT_ADMIN_KEY"];
  if (!secret) throw new Error("Admin access is not configured");
  const { createHash, timingSafeEqual } = await import("node:crypto");
  const digest = (value: string) => createHash("sha256").update(value, "utf8").digest();
  if (!timingSafeEqual(digest(adminKey), digest(secret))) {
    throw new Error("Unauthorized");
  }
}

type Row = {
  id: string;
  content_number: string;
  title: string;
  platform: "linkedin" | "tiktok";
  status: string;
  scheduled_for: string | null;
  buffer_post_id: string | null;
  published_at: string | null;
  caption: string;
  hook: string;
  asset_url: string | null;
  buffer_channel_id: string;
  tiktok_publish_mode: "direct_publish" | "notification_publish" | null;
  last_error: string | null;
  views: number | null;
  impressions: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  clicks: number | null;
};

const LIST_COLUMNS =
  "id, content_number, title, platform, status, scheduled_for, buffer_post_id, published_at, caption, hook, asset_url, buffer_channel_id, tiktok_publish_mode, last_error, views, impressions, likes, comments, shares, clicks";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function safeMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : "Unknown error";
  // Strip anything that could carry a token or full request detail.
  return raw.replace(/Bearer\s+\S+/gi, "[redacted]").slice(0, 300);
}

export const listSocialContent = createServerFn({ method: "POST" })
  .inputValidator((data: { adminKey: string }) =>
    z.object({ adminKey: adminKeySchema }).parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();
    const { data: rows, error } = await db
      .from("social_content")
      .select(LIST_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw new Error(safeMessage(error));
    return { rows: (rows ?? []) as Row[] };
  });

export const approveSocialContent = createServerFn({ method: "POST" })
  .inputValidator((data: { adminKey: string; id: string }) =>
    z.object({ adminKey: adminKeySchema, id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();
    const { error } = await db
      .from("social_content")
      .update({ status: "approved", last_error: null })
      .eq("id", data.id)
      .in("status", ["draft", "failed", "cancelled"]);
    if (error) throw new Error(safeMessage(error));
    return { ok: true };
  });

/**
 * Cancels a row. If it already has a scheduled Buffer post, the post is removed
 * from Buffer first so nothing stays queued.
 */
export const cancelSocialContent = createServerFn({ method: "POST" })
  .inputValidator((data: { adminKey: string; id: string }) =>
    z.object({ adminKey: adminKeySchema, id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();

    const { data: row, error: readError } = await db
      .from("social_content")
      .select("id, status, buffer_post_id")
      .eq("id", data.id)
      .maybeSingle();
    if (readError) throw new Error(safeMessage(readError));
    if (!row) throw new Error("Content not found");
    if (row.status === "published") throw new Error("Published content cannot be cancelled");

    let removedFromBuffer = false;
    if (row.buffer_post_id) {
      const { deleteBufferPost } = await import("@/lib/buffer.server");
      try {
        await deleteBufferPost(row.buffer_post_id);
        removedFromBuffer = true;
      } catch (err) {
        const message = safeMessage(err);
        await db.from("social_content").update({ last_error: message }).eq("id", row.id);
        return { ok: false as const, error: message };
      }
    }

    const { error } = await db
      .from("social_content")
      .update({
        status: "cancelled",
        buffer_post_id: null,
        scheduled_for: null,
        last_error: null,
      })
      .eq("id", data.id);
    if (error) throw new Error(safeMessage(error));
    return { ok: true as const, removedFromBuffer };
  });


/**
 * Sends an APPROVED row to Buffer. Drafts are refused before any network call.
 * `scheduledFor` omitted means "add to the channel queue"; supplied means a
 * custom future time. TikTok defaults to notification_publish so native sounds
 * can be added in the TikTok app before the operator posts.
 */
export const scheduleSocialContent = createServerFn({ method: "POST" })
  .inputValidator((data: { adminKey: string; id: string; scheduledFor?: string | null }) =>
    z
      .object({
        adminKey: adminKeySchema,
        id: z.string().uuid(),
        scheduledFor: z.string().datetime().nullish(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();

    const { data: row, error } = await db
      .from("social_content")
      .select(LIST_COLUMNS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(safeMessage(error));
    if (!row) throw new Error("Content not found");

    // Hard gate: only approved content may ever reach Buffer.
    if (row.status !== "approved") {
      throw new Error(
        `Only approved content can be sent to Buffer (this row is ${row.status})`,
      );
    }

    const { createBufferPost, BUYERFRONT_CHANNELS } = await import("@/lib/buffer.server");

    const expectedChannel =
      row.platform === "linkedin" ? BUYERFRONT_CHANNELS.linkedin : BUYERFRONT_CHANNELS.tiktok;
    if (row.buffer_channel_id !== expectedChannel) {
      throw new Error("Channel mapping does not match the verified Buyerfront channels");
    }

    const notifyOnly =
      row.platform === "tiktok" && (row.tiktok_publish_mode ?? "notification_publish") === "notification_publish";
    const text = [row.hook, row.caption].filter(Boolean).join("\n\n");

    try {
      const result = await createBufferPost({
        channelId: row.buffer_channel_id,
        text,
        assetUrl: row.asset_url,
        scheduledFor: data.scheduledFor ?? null,
        notifyOnly,
      });
      await db
        .from("social_content")
        .update({
          status: "scheduled",
          buffer_post_id: result.postId,
          scheduled_for: data.scheduledFor ?? result.dueAt,
          last_error: null,
        })
        .eq("id", row.id);
      return { ok: true as const, postId: result.postId, notifyOnly };
    } catch (err) {
      const message = safeMessage(err);
      await db
        .from("social_content")
        .update({ status: "failed", last_error: message })
        .eq("id", row.id);
      return { ok: false as const, error: message };
    }
  });

/** Refreshes Buffer status and available metrics for a scheduled/published row. */
export const syncSocialContentStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { adminKey: string; id: string }) =>
    z.object({ adminKey: adminKeySchema, id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.adminKey);
    const db = await admin();

    const { data: row, error } = await db
      .from("social_content")
      .select("id, buffer_post_id, status")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(safeMessage(error));
    if (!row?.buffer_post_id) throw new Error("This row has no Buffer post yet");

    const { getBufferPostStatus } = await import("@/lib/buffer.server");
    try {
      const status = await getBufferPostStatus(row.buffer_post_id);
      const published = Boolean(status.sentAt) || status.status?.toLowerCase() === "sent";
      await db
        .from("social_content")
        .update({
          status: published ? "published" : row.status,
          published_at: status.sentAt ?? null,
          views: status.metrics.views,
          impressions: status.metrics.impressions,
          likes: status.metrics.likes,
          comments: status.metrics.comments,
          shares: status.metrics.shares,
          clicks: status.metrics.clicks,
          last_error: null,
        })
        .eq("id", row.id);
      return { ok: true as const, status: status.status, published };
    } catch (err) {
      const message = safeMessage(err);
      await db.from("social_content").update({ status: "failed", last_error: message }).eq("id", row.id);
      return { ok: false as const, error: message };
    }
  });
