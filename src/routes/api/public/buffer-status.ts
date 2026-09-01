import { createFileRoute } from "@tanstack/react-router";

import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

// Read-only Buffer connection check. Requires the shared bearer secret; the
// Buffer credential itself is never returned or logged.
export const Route = createFileRoute("/api/public/buffer-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const unauthorized = await authenticateCronRequest(request);
        if (unauthorized) return unauthorized;

        const { getBufferConnectionReport, BufferApiError } = await import(
          "@/lib/buffer.server"
        );

        try {
          const report = await getBufferConnectionReport();
          return Response.json(
            {
              ok: true,
              accountId: report.account.id,
              organizations: report.account.organizations,
              channels: report.channels.map((c) => ({
                platform: c.service,
                channelName: c.name,
                channelId: c.id,
                serviceId: c.serviceId,
              })),
              buyerfront: {
                linkedin: report.matched.linkedin
                  ? {
                      platform: report.matched.linkedin.service,
                      channelName: report.matched.linkedin.name,
                      channelId: report.matched.linkedin.id,
                    }
                  : null,
                tiktok: report.matched.tiktok
                  ? {
                      platform: report.matched.tiktok.service,
                      channelName: report.matched.tiktok.name,
                      channelId: report.matched.tiktok.id,
                    }
                  : null,
              },
            },
            { headers: { "cache-control": "no-store" } },
          );
        } catch (error) {
          const isKnown = error instanceof BufferApiError;
          const message = isKnown
            ? error.message
            : "Buffer connection check failed";
          console.error(`[buffer-status] ${message}`);
          return Response.json(
            { ok: false, error: message },
            {
              status: isKnown ? error.status : 502,
              headers: { "cache-control": "no-store" },
            },
          );
        }
      },
    },
  },
});
