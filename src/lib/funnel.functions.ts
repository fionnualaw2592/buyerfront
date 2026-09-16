import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { FUNNEL_EVENT_NAMES } from "./funnel-attribution";

export const attributionSchema = z.object({
  utmSource: z.string().trim().max(160).nullable(),
  utmMedium: z.string().trim().max(160).nullable(),
  utmCampaign: z.string().trim().max(160).nullable(),
  utmContent: z.string().trim().max(160).nullable(),
  landingPath: z.string().trim().min(1).max(500),
  referrerDomain: z.string().trim().max(253).nullable(),
});

export type ValidatedAttribution = z.infer<typeof attributionSchema>;

export function attributionToRow(attribution: ValidatedAttribution) {
  return {
    utm_source: attribution.utmSource,
    utm_medium: attribution.utmMedium,
    utm_campaign: attribution.utmCampaign,
    utm_content: attribution.utmContent,
    landing_path: attribution.landingPath,
    referrer_domain: attribution.referrerDomain,
  };
}

const eventSchema = z.object({
  eventName: z.enum(FUNNEL_EVENT_NAMES),
  attribution: attributionSchema,
});

export const trackFunnelEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => eventSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("funnel_events").insert({
      event_name: data.eventName,
      ...attributionToRow(data.attribution),
    });

    if (error) throw new Error("analytics_write_failed");
    return { ok: true as const };
  });
