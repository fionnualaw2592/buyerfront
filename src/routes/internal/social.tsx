import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  approveSocialContent,
  cancelSocialContent,
  listSocialContent,
  scheduleSocialContent,
  syncSocialContentStatus,
} from "@/lib/social.functions";

export const Route = createFileRoute("/internal/social")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Social content (internal) | Buyerfront" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SocialAdmin,
});

type Row = Awaited<ReturnType<typeof listSocialContent>>["rows"][number];

const STORAGE_KEY = "bf-admin-key";

function SocialAdmin() {
  const [adminKey, setAdminKey] = useState(
    () => (typeof window === "undefined" ? "" : sessionStorage.getItem(STORAGE_KEY) ?? ""),
  );
  const [rows, setRows] = useState<Row[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const list = useServerFn(listSocialContent);
  const approve = useServerFn(approveSocialContent);
  const cancel = useServerFn(cancelSocialContent);
  const schedule = useServerFn(scheduleSocialContent);
  const sync = useServerFn(syncSocialContentStatus);

  const run = async (fn: () => Promise<unknown>, note?: string) => {
    setBusy(true);
    setMessage(note ?? null);
    try {
      const result = (await fn()) as { ok?: boolean; error?: string } | undefined;
      if (result && result.ok === false) setMessage(result.error ?? "Request failed");
      else if (note) setMessage(note);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  const refresh = async (key = adminKey) => {
    setBusy(true);
    try {
      const normalizedKey = key.trim();
      const result = await list({ data: { adminKey: normalizedKey } });
      setRows(result.rows);
      setAdminKey(normalizedKey);
      sessionStorage.setItem(STORAGE_KEY, normalizedKey);
      setMessage(null);
    } catch {
      setRows(null);
      setMessage("Could not load content. Check the admin key.");
    } finally {
      setBusy(false);
    }
  };

  if (rows === null) {
    return (
      <main id="main" className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6">
        <h1 className="font-serif text-2xl">Social content</h1>
        <p className="text-sm text-muted-foreground">Internal view. Enter the admin key to continue.</p>
        <Input
          type="password"
          value={adminKey}
          onChange={(event) => setAdminKey(event.target.value)}
          placeholder="Admin key"
          aria-label="Admin key"
        />
        <Button onClick={() => refresh()} disabled={busy || adminKey.length < 16}>
          {busy ? "Checking..." : "Open"}
        </Button>
        {message ? <p className="text-sm text-destructive">{message}</p> : null}
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl">Social content</h1>
        <Button variant="outline" onClick={() => refresh()} disabled={busy}>
          Refresh
        </Button>
      </header>

      {message ? <p className="mb-4 text-sm text-muted-foreground">{message}</p> : null}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              {["Number", "Platform", "Title", "Status", "Scheduled", "Buffer post", "Metrics", "Actions"].map(
                (heading) => (
                  <th key={heading} className="py-2 pr-4 font-medium text-muted-foreground">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b align-top">
                <td className="py-3 pr-4 font-mono text-xs">{row.content_number}</td>
                <td className="py-3 pr-4">{row.platform}</td>
                <td className="py-3 pr-4">{row.title}</td>
                <td className="py-3 pr-4">
                  {row.status}
                  {row.last_error ? (
                    <span className="block text-xs text-destructive">{row.last_error}</span>
                  ) : null}
                </td>
                <td className="py-3 pr-4">
                  {row.scheduled_for ? new Date(row.scheduled_for).toLocaleString() : "-"}
                </td>
                <td className="py-3 pr-4 font-mono text-xs">{row.buffer_post_id ?? "-"}</td>
                <td className="py-3 pr-4 text-xs">
                  {[
                    ["views", row.views],
                    ["impr", row.impressions],
                    ["likes", row.likes],
                    ["comments", row.comments],
                    ["shares", row.shares],
                    ["clicks", row.clicks],
                  ]
                    .filter(([, value]) => value !== null && value !== undefined)
                    .map(([label, value]) => `${label} ${value}`)
                    .join(" / ") || "-"}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy || row.status === "published"}
                      onClick={() =>
                        run(async () => {
                          await approve({ data: { adminKey, id: row.id } });
                          await refresh();
                        }, `${row.content_number} approved`)
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy || row.status !== "approved"}
                      onClick={() => {
                        const input = window.prompt(
                          "Schedule for (ISO date/time, blank for the channel queue):",
                          "",
                        );
                        if (input === null) return;
                        const scheduledFor = input.trim()
                          ? new Date(input.trim()).toISOString()
                          : null;
                        void run(async () => {
                          const result = await schedule({
                            data: { adminKey, id: row.id, scheduledFor },
                          });
                          await refresh();
                          return result;
                        }, `${row.content_number} sent to Buffer`);
                      }}
                    >
                      Schedule
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy || !row.buffer_post_id}
                      onClick={() =>
                        run(async () => {
                          const result = await sync({ data: { adminKey, id: row.id } });
                          await refresh();
                          return result;
                        }, `${row.content_number} synced`)
                      }
                    >
                      Sync
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy || row.status === "published"}
                      onClick={() =>
                        run(async () => {
                          await cancel({ data: { adminKey, id: row.id } });
                          await refresh();
                        }, `${row.content_number} cancelled`)
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
