import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  company: z.string().trim().min(1).max(160),
  website: z.string().trim().min(3).max(200),
  sells: z.string().trim().min(3).max(600),
  competitor: z.string().trim().max(600).optional().default(""),
});

export type SnapshotRequestInput = z.input<typeof schema>;

export const submitSnapshotRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { sendTemplateEmail } = await import("./email-templates/send-email");

    const submittedAt = new Date().toUTCString();
    const idempotencyKey = `snapshot-${data.email.toLowerCase()}-${Math.floor(Date.now() / 60000)}`;

    // The notification email is the record of the lead, so a failure must
    // surface to the visitor rather than be swallowed.
    await sendTemplateEmail("snapshot-request", "hello@buyerfront.ie", {
      templateData: {
        name: data.name,
        email: data.email,
        company: data.company,
        website: data.website,
        sells: data.sells,
        competitor: data.competitor?.trim() ? data.competitor : "Not provided",
        submittedAt,
      },
      idempotencyKey,
      replyTo: data.email,
    });

    return { ok: true as const };
  });
