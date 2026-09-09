import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  addFinding,
  compareMonitoring,
  createDiagnostic,
  createMonitoringRerun,
  deleteFinding,
  getDiagnostic,
  getRunPayload,
  importManualRun,
  listDiagnostics,
  runDiagnostic,
  saveCompetitors,
  savePrompts,
  testProviderConnection,
  updateDiagnostic,
} from "@/lib/diagnostics.functions";
import {
  MEASUREMENT_DISCLAIMER,
  PROVIDER_IDS,
  PROVIDER_LABELS,
  PROVIDER_MODELS,
  type ProviderId,
} from "@/lib/diagnostics/models";
import { DIAGNOSTIC_TYPE_LABELS, DIAGNOSTIC_TYPE_PURPOSE } from "@/lib/diagnostics/presets";

export const Route = createFileRoute("/internal/diagnostics")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Diagnostics (internal) | Buyerfront" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DiagnosticsAdmin;
});

const STORAGE_KEY = "bf-admin-key";

type Detail = Awaited<ReturnType<typeof getDiagnostic>>;
type ListRow = Awaited<ReturnType<typeof listDiagnostics>>["rows"][number];

const percent = (value: number) => `${(value * 100).toFixed(0)}%`;
const money = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : `$${Number(value).toFixed(4)}`;

function promptsToText(prompts: Detail["prompts"]): string {
  return prompts
    .map((prompt) => `${prompt.enabled ? "" : "# "}${prompt.intent_type} :: ${prompt.prompt_text}`)
    .join("\n");
}

function textToPrompts(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const enabled = !line.startsWith("#");
      const body = enabled ? line : line.replace(/^#\s*/, "");
      const [intent, ...rest] = body.split("::");
      const promptText = rest.join("::").trim();
      return promptText
        ? { text: promptText, intentType: intent.trim() || "high_intent", enabled }
        : { text: body.trim(), intentType: "high_intent", enabled };
    });
}

function competitorsToText(competitors: Detail["competitors"]): string {
  return competitors
    .map(
      (competitor) =>
        `${competitor.competitor_name} | ${competitor.competitor_website ?? ""} | ${(competitor.aliases ?? []).join(", ")}`,
    )
    .join("\n");
}

function textToCompetitors(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", website = "", aliases = ""] = line.split("|").map((part) => part.trim());
      return {
        name,
        website,
        aliases: aliases
          .split(",")
          .map((alias) => alias.trim())
          .filter(Boolean),
      };
    })
    .filter((competitor) => competitor.name.length > 0);
}

function DiagnosticsAdmin() {
  const [adminKey, setAdminKey] = useState(() =>
    typeof window === "undefined" ? "" : (sessionStorage.getItem(STORAGE_KEY) ?? ""),
  );
  const [rows, setRows] = useState<ListRow[] | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reportMode, setReportMode] = useState(false);
  const [openRun, setOpenRun] = useState<{ id: string; payload: string } | null>(null);

  const list = useServerFn(listDiagnostics);
  const detailFn = useServerFn(getDiagnostic);
  const create = useServerFn(createDiagnostic);
  const update = useServerFn(updateDiagnostic);
  const setCompetitors = useServerFn(saveCompetitors);
  const setPrompts = useServerFn(savePrompts);
  const test = useServerFn(testProviderConnection);
  const runFn = useServerFn(runDiagnostic);
  const importRun = useServerFn(importManualRun);
  const finding = useServerFn(addFinding);
  const removeFinding = useServerFn(deleteFinding);
  const rerun = useServerFn(createMonitoringRerun);
  const compare = useServerFn(compareMonitoring);
  const runPayload = useServerFn(getRunPayload);

  const refreshList = useCallback(
    async (key = adminKey) => {
      setBusy(true);
      try {
        const result = await list({ data: { adminKey: key } });
        setRows(result.rows);
        sessionStorage.setItem(STORAGE_KEY, key);
        setMessage(null);
      } catch {
        setRows(null);
        setMessage("Could not load diagnostics. Check the admin key.");
      } finally {
        setBusy(false);
      }
    },
    [adminKey, list],
  );

  const openDiagnostic = useCallback(
    async (id: string) => {
      setBusy(true);
      try {
        setDetail(await detailFn({ data: { adminKey, id } }));
        setOpenRun(null);
        setMessage(null);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not open diagnostic");
      } finally {
        setBusy(false);
      }
    },
    [adminKey, detailFn],
  );

  const act = async (fn: () => Promise<unknown>, note: string) => {
    setBusy(true);
    setMessage(note);
    try {
      const result = (await fn()) as { ok?: boolean; error?: string | null } | undefined;
      if (result && result.ok === false) setMessage(result.error ?? "Request failed");
      else setMessage(note);
      if (detail) setDetail(await detailFn({ data: { adminKey, id: detail.diagnostic.id } }));
      await refreshList();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  if (rows === null) {
    return (
      <main
        id="main"
        className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6"
      >
        <h1 className="font-serif text-2xl">Diagnostics</h1>
        <p className="text-sm text-muted-foreground">
          Internal view. Enter the admin key to continue.
        </p>
        <Input
          type="password"
          value={adminKey}
          onChange={(event) => setAdminKey(event.target.value)}
          placeholder="Admin key"
          aria-label="Admin key"
        />
        <Button onClick={() => refreshList()} disabled={busy || adminKey.length < 16}>
          {busy ? "Checking..." : "Open"}
        </Button>
        {message ? <p className="text-sm text-destructive">{message}</p> : null}
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto max-w-6xl px-6 py-10">
      <style>{`@media print { .no-print { display: none !important; } body { background: #fff; } }`}</style>

      <header className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl">Buyerfront Diagnostic Engine</h1>
        <div className="flex gap-2">
          {detail ? (
            <>
              <Button variant="outline" onClick={() => setReportMode((value) => !value)}>
                {reportMode ? "Back to workbench" : "Report view"}
              </Button>
              <Button variant="ghost" onClick={() => setDetail(null)}>
                Close
              </Button>
            </>
          ) : null}
          <Button variant="outline" onClick={() => refreshList()} disabled={busy}>
            Refresh
          </Button>
        </div>
      </header>

      {message ? <p className="no-print mb-4 text-sm text-muted-foreground">{message}</p> : null}

      {!detail ? (
        <ListView
          rows={rows}
          busy={busy}
          onOpen={openDiagnostic}
          onCreate={async (payload) => {
            setBusy(true);
            try {
              const created = await create({ data: { adminKey, ...payload } });
              setMessage(`${created.diagnosticNumber} created`);
              await refreshList();
              await openDiagnostic(created.id);
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Could not create diagnostic");
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : reportMode ? (
        <ReportView detail={detail} />
      ) : (
        <DetailView
          detail={detail}
          rows={rows}
          busy={busy}
          openRun={openRun}
          onViewRun={async (runId) => {
            if (openRun?.id === runId) return setOpenRun(null);
            const result = await runPayload({ data: { adminKey, runId } });
            setOpenRun({ id: runId, payload: JSON.stringify(result.run, null, 2) });
          }}
          onSaveConfig={(payload) =>
            act(
              () => update({ data: { adminKey, id: detail.diagnostic.id, ...payload } }),
              "Configuration saved",
            )
          }
          onSavePrompts={(text) =>
            act(
              () =>
                setPrompts({
                  data: { adminKey, id: detail.diagnostic.id, prompts: textToPrompts(text) },
                }),
              "Prompts saved",
            )
          }
          onSaveCompetitors={(text) =>
            act(
              () =>
                setCompetitors({
                  data: {
                    adminKey,
                    id: detail.diagnostic.id,
                    competitors: textToCompetitors(text),
                  },
                }),
              "Competitors saved",
            )
          }
          onTest={(provider) =>
            act(async () => {
              const result = await test({
                data: { adminKey, id: detail.diagnostic.id, provider, confirm: true },
              });
              setMessage(
                result.ok
                  ? `${PROVIDER_LABELS[provider]} test passed. Model ${result.model}${result.modelVersion ? ` (${result.modelVersion})` : ""}, mode ${result.groundingMode}, ${result.citations} citations, estimated ${money(result.estimatedCostUsd)}.`
                  : (result.error ?? "Test failed"),
              );
              return result;
            }, `Testing ${PROVIDER_LABELS[provider]}...`)
          }
          onRun={(force) =>
            act(async () => {
              const result = await runFn({
                data: { adminKey, id: detail.diagnostic.id, confirm: true, force },
              });
              if (result.ok) {
                setMessage(
                  `Run ${result.status}: ${result.succeeded} of ${result.expectedCalls} calls succeeded, ${result.failed} failed. Estimated cost ${money(result.estimatedCostUsd)}.${result.aborted ? ` ${result.aborted}` : ""}`,
                );
              }
              return result;
            }, "Running diagnostic...")
          }
          onImport={(payload) =>
            act(
              () => importRun({ data: { adminKey, id: detail.diagnostic.id, ...payload } }),
              "Manual response imported",
            )
          }
          onAddFinding={(payload) =>
            act(
              () => finding({ data: { adminKey, id: detail.diagnostic.id, ...payload } }),
              "Finding added",
            )
          }
          onDeleteFinding={(findingId) =>
            act(() => removeFinding({ data: { adminKey, findingId } }), "Finding removed")
          }
          onRerun={() =>
            act(async () => {
              const created = await rerun({
                data: { adminKey, baselineId: detail.diagnostic.id },
              });
              setMessage(`${created.diagnosticNumber} created as a monitoring rerun`);
              return { ok: true };
            }, "Creating monitoring rerun...")
          }
          onCompare={(baselineId, comparisonId) =>
            act(
              () => compare({ data: { adminKey, baselineId, comparisonId } }),
              "Comparison stored",
            )
          }
        />
      )}
    </main>
  );
}

// ---------------------------------------------------------------------------

function ListView({
  rows,
  busy,
  onOpen,
  onCreate,
}: {
  rows: ListRow[];
  busy: boolean;
  onOpen: (id: string) => void;
  onCreate: (payload: {
    companyName: string;
    website: string;
    market: string;
    diagnosticType: "mini_signal" | "snapshot" | "deep_dive" | "monitoring";
    category: string;
    targetAliases: string[];
    competitors: { name: string; website: string; aliases: string[] }[];
  }) => void;
}) {
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [market, setMarket] = useState("Ireland");
  const [category, setCategory] = useState("CRM software");
  const [type, setType] = useState<"mini_signal" | "snapshot" | "deep_dive" | "monitoring">(
    "snapshot",
  );
  const [aliases, setAliases] = useState("");
  const [competitorText, setCompetitorText] = useState("");

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Diagnostics
        </h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              {["Number", "Company", "Type", "Status", "Created", ""].map((heading) => (
                <th key={heading} className="py-2 pr-4 font-medium text-muted-foreground">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">{row.diagnostic_number}</td>
                <td className="py-2 pr-4">{row.company_name}</td>
                <td className="py-2 pr-4">{DIAGNOSTIC_TYPE_LABELS[row.diagnostic_type]}</td>
                <td className="py-2 pr-4">{row.status}</td>
                <td className="py-2 pr-4 text-xs">
                  {new Date(row.created_at).toLocaleDateString()}
                </td>
                <td className="py-2">
                  <Button size="sm" variant="outline" onClick={() => onOpen(row.id)} disabled={busy}>
                    Open
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="py-4 text-sm text-muted-foreground" colSpan={6}>
                  No diagnostics yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <section className="rounded border p-4">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          New diagnostic
        </h2>
        <div className="grid gap-3">
          <Input
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="Target company"
            aria-label="Target company"
          />
          <Input
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="Website"
            aria-label="Website"
          />
          <Input
            value={market}
            onChange={(event) => setMarket(event.target.value)}
            placeholder="Market"
            aria-label="Market"
          />
          <Input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Buying category, e.g. CRM software"
            aria-label="Buying category"
          />
          <label className="text-xs text-muted-foreground">
            Diagnostic type
            <select
              className="mt-1 w-full rounded border bg-background p-2 text-sm"
              value={type}
              onChange={(event) => setType(event.target.value as typeof type)}
            >
              {Object.entries(DIAGNOSTIC_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-muted-foreground">{DIAGNOSTIC_TYPE_PURPOSE[type]}</p>
          <Input
            value={aliases}
            onChange={(event) => setAliases(event.target.value)}
            placeholder="Target aliases, comma separated"
            aria-label="Target aliases"
          />
          <Textarea
            value={competitorText}
            onChange={(event) => setCompetitorText(event.target.value)}
            placeholder={"Competitors, one per line:\nName | website | alias, alias"}
            aria-label="Competitors"
            rows={4}
          />
          <Button
            disabled={busy || companyName.trim().length === 0 || website.trim().length === 0}
            onClick={() =>
              onCreate({
                companyName: companyName.trim(),
                website: website.trim(),
                market: market.trim() || "Global",
                diagnosticType: type,
                category: category.trim() || "software",
                targetAliases: aliases
                  .split(",")
                  .map((alias) => alias.trim())
                  .filter(Boolean),
                competitors: textToCompetitors(competitorText),
              })
            }
          >
            Create
          </Button>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------

function DetailView({
  detail,
  rows,
  busy,
  openRun,
  onViewRun,
  onSaveConfig,
  onSavePrompts,
  onSaveCompetitors,
  onTest,
  onRun,
  onImport,
  onAddFinding,
  onDeleteFinding,
  onRerun,
  onCompare,
}: {
  detail: Detail;
  rows: ListRow[];
  busy: boolean;
  openRun: { id: string; payload: string } | null;
  onViewRun: (runId: string) => void;
  onSaveConfig: (payload: Record<string, unknown>) => void;
  onSavePrompts: (text: string) => void;
  onSaveCompetitors: (text: string) => void;
  onTest: (provider: ProviderId) => void;
  onRun: (force: boolean) => void;
  onImport: (payload: {
    promptId: string | null;
    promptText: string;
    responseText: string;
    sourceUrls: string[];
    sourceLabel: string;
  }) => void;
  onAddFinding: (payload: {
    findingType: "observed" | "inferred";
    finding: string;
    supportingEvidence: string;
    runIds: string[];
  }) => void;
  onDeleteFinding: (findingId: string) => void;
  onRerun: () => void;
  onCompare: (baselineId: string, comparisonId: string) => void;
}) {
  const diagnostic = detail.diagnostic;
  const [promptText, setPromptText] = useState(() => promptsToText(detail.prompts));
  const [competitorText, setCompetitorText] = useState(() =>
    competitorsToText(detail.competitors),
  );
  const [config, setConfig] = useState(detail.providerConfig);
  const [maxCost, setMaxCost] = useState(String(diagnostic.max_estimated_cost_usd));
  const [maxCalls, setMaxCalls] = useState(String(diagnostic.max_provider_calls));
  const [findingType, setFindingType] = useState<"observed" | "inferred">("observed");
  const [findingText, setFindingText] = useState("");
  const [evidenceText, setEvidenceText] = useState("");
  const [manual, setManual] = useState({ prompt: "", response: "", sources: "", label: "" });
  const [compareWith, setCompareWith] = useState("");

  const connected = useMemo(
    () => new Map(detail.providerStatus.map((status) => [status.provider, status.connected])),
    [detail.providerStatus],
  );
  const anyConnected = detail.providerStatus.some((status) => status.connected);
  const target = detail.metrics.brands.find((brand) => brand.isTarget);

  return (
    <div className="grid gap-10">
      <section>
        <h2 className="font-serif text-xl">
          {diagnostic.diagnostic_number} {diagnostic.company_name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {diagnostic.website} / {diagnostic.market} /{" "}
          {DIAGNOSTIC_TYPE_LABELS[diagnostic.diagnostic_type]} / status {diagnostic.status}
        </p>
        {!anyConnected ? (
          <p className="mt-3 rounded border-l-2 border-signal bg-secondary/50 p-3 text-sm">
            Live providers not connected. Diagnostic architecture is ready.
          </p>
        ) : null}
      </section>

      <section className="no-print grid gap-4 rounded border p-4">
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Providers, models and cost controls
        </h3>
        {PROVIDER_IDS.map((provider) => {
          const entry = config[provider];
          if (!entry) return null;
          return (
            <div key={provider} className="flex flex-wrap items-center gap-3 border-b pb-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={entry.enabled}
                  onChange={(event) =>
                    setConfig({
                      ...config,
                      [provider]: { ...entry, enabled: event.target.checked },
                    })
                  }
                />
                <span className="w-32">{PROVIDER_LABELS[provider]}</span>
              </label>
              <span
                className={
                  connected.get(provider) ? "text-xs text-signal" : "text-xs text-muted-foreground"
                }
              >
                {connected.get(provider) ? "Connected" : "Not connected"}
              </span>
              <select
                className="rounded border bg-background p-1 text-xs"
                value={entry.model}
                onChange={(event) =>
                  setConfig({ ...config, [provider]: { ...entry, model: event.target.value } })
                }
              >
                {PROVIDER_MODELS[provider].map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={entry.grounded}
                  onChange={(event) =>
                    setConfig({
                      ...config,
                      [provider]: { ...entry, grounded: event.target.checked },
                    })
                  }
                />
                Grounded / search
              </label>
              <Button
                size="sm"
                variant="outline"
                disabled={busy || !connected.get(provider)}
                onClick={() => {
                  const ok = window.confirm(
                    `Send ONE small paid test request?\n\nProvider: ${PROVIDER_LABELS[provider]}\nModel: ${entry.model}\nGrounding: ${entry.grounded ? "grounded" : "ungrounded"}\nConfigured maximum spend for this diagnostic: $${Number(maxCost).toFixed(2)}`,
                  );
                  if (ok) onTest(provider);
                }}
              >
                Test connection
              </Button>
            </div>
          );
        })}

        <div className="flex flex-wrap items-end gap-3 text-sm">
          <label className="text-xs text-muted-foreground">
            Max estimated cost (USD)
            <Input
              value={maxCost}
              onChange={(event) => setMaxCost(event.target.value)}
              className="mt-1 w-32"
              aria-label="Max estimated cost"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Max provider calls
            <Input
              value={maxCalls}
              onChange={(event) => setMaxCalls(event.target.value)}
              className="mt-1 w-32"
              aria-label="Max provider calls"
            />
          </label>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() =>
              onSaveConfig({
                providerConfig: config,
                maxEstimatedCostUsd: Number(maxCost) || 0,
                maxProviderCalls: Number(maxCalls) || 0,
              })
            }
          >
            Save configuration
          </Button>
        </div>

        <p className="text-sm">
          Expected calls: <strong>{detail.estimate.calls}</strong> (enabled prompts{" "}
          {detail.prompts.filter((prompt) => prompt.enabled).length} x connected selected providers{" "}
          {detail.estimate.perProvider.length}). Estimated cost:{" "}
          <strong>{money(detail.estimate.totalUsd)}</strong>.
        </p>
        <div className="flex gap-2">
          <Button
            disabled={busy || !anyConnected || detail.estimate.calls === 0}
            onClick={() => {
              const ok = window.confirm(
                `Run diagnostic now?\n\nExpected calls: ${detail.estimate.calls}\nEstimated cost: ${money(detail.estimate.totalUsd)}\nHard limits: ${diagnostic.max_provider_calls} calls / $${Number(diagnostic.max_estimated_cost_usd).toFixed(2)}`,
              );
              if (ok) onRun(false);
            }}
          >
            Run diagnostic
          </Button>
          <Button
            variant="ghost"
            disabled={busy || !anyConnected}
            onClick={() => {
              const ok = window.confirm(
                "Force a rerun into this same diagnostic? Existing runs are preserved, but monitoring comparisons are cleaner when you create a monitoring rerun instead.",
              );
              if (ok) onRun(true);
            }}
          >
            Force rerun
          </Button>
          <Button variant="outline" disabled={busy} onClick={onRerun}>
            Create monitoring rerun
          </Button>
        </div>
      </section>

      <section className="no-print grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Prompts (prefix # to disable, format: intent :: prompt)
          </h3>
          <Textarea
            value={promptText}
            onChange={(event) => setPromptText(event.target.value)}
            rows={10}
            aria-label="Prompts"
          />
          <Button
            className="mt-2"
            variant="outline"
            disabled={busy}
            onClick={() => onSavePrompts(promptText)}
          >
            Save prompts
          </Button>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Competitors (Name | website | aliases)
          </h3>
          <Textarea
            value={competitorText}
            onChange={(event) => setCompetitorText(event.target.value)}
            rows={10}
            aria-label="Competitors"
          />
          <Button
            className="mt-2"
            variant="outline"
            disabled={busy}
            onClick={() => onSaveCompetitors(competitorText)}
          >
            Save competitors
          </Button>
        </div>
      </section>

      <MetricsTables detail={detail} />

      <section>
        <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Runs and raw evidence
        </h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              {["Provider", "Model", "Mode", "Status", "Prompt", "Citations", "Cost", ""].map(
                (heading) => (
                  <th key={heading} className="py-2 pr-3 font-medium text-muted-foreground">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {detail.runs.map((run) => (
              <tr key={run.id} className="border-b align-top">
                <td className="py-2 pr-3">
                  {PROVIDER_LABELS[run.provider]}
                  {run.is_test_connection ? (
                    <span className="block text-xs text-muted-foreground">test</span>
                  ) : null}
                  {run.is_manual_import ? (
                    <span className="block text-xs text-muted-foreground">manual import</span>
                  ) : null}
                </td>
                <td className="py-2 pr-3 text-xs">
                  {run.model_name}
                  {run.model_version ? ` (${run.model_version})` : ""}
                </td>
                <td className="py-2 pr-3 text-xs">{run.grounding_mode}</td>
                <td className="py-2 pr-3 text-xs">
                  {run.run_status}
                  {run.error_message ? (
                    <span className="block text-destructive">{run.error_message}</span>
                  ) : null}
                </td>
                <td className="max-w-xs py-2 pr-3 text-xs">{run.prompt_text}</td>
                <td className="py-2 pr-3 text-xs">
                  {Array.isArray(run.source_urls_json) ? run.source_urls_json.length : 0}
                </td>
                <td className="py-2 pr-3 text-xs">{money(run.estimated_cost_usd)}</td>
                <td className="py-2">
                  <Button size="sm" variant="ghost" onClick={() => onViewRun(run.id)}>
                    {openRun?.id === run.id ? "Hide" : "View"}
                  </Button>
                </td>
              </tr>
            ))}
            {detail.runs.length === 0 ? (
              <tr>
                <td className="py-3 text-sm text-muted-foreground" colSpan={8}>
                  No runs stored yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        {openRun ? (
          <pre className="mt-3 max-h-96 overflow-auto rounded border bg-secondary/40 p-3 text-xs">
            {openRun.payload}
          </pre>
        ) : null}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Extracted mentions
        </h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              {["Brand", "Detected string", "Position", "Top 3", "First", "Context"].map(
                (heading) => (
                  <th key={heading} className="py-2 pr-3 font-medium text-muted-foreground">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {detail.mentions.map((mention) => (
              <tr key={mention.id} className="border-b align-top">
                <td className="py-2 pr-3">
                  {mention.canonical_brand_name}
                  {mention.is_target_brand ? " (target)" : ""}
                </td>
                <td className="py-2 pr-3 font-mono text-xs">{mention.brand_name}</td>
                <td className="py-2 pr-3">{mention.mention_position}</td>
                <td className="py-2 pr-3">{mention.is_top_3 ? "yes" : "no"}</td>
                <td className="py-2 pr-3">{mention.is_first_mentioned ? "yes" : "no"}</td>
                <td className="max-w-md py-2 pr-3 text-xs">{mention.recommendation_context}</td>
              </tr>
            ))}
            {detail.mentions.length === 0 ? (
              <tr>
                <td className="py-3 text-sm text-muted-foreground" colSpan={6}>
                  No mentions extracted yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <section className="no-print grid gap-3 rounded border p-4">
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Findings
        </h3>
        <ul className="grid gap-2 text-sm">
          {detail.findings.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 border-b pb-2">
              <span>
                <strong className="uppercase text-xs">{item.finding_type}</strong> {item.finding}
                {item.supporting_evidence ? (
                  <span className="block text-xs text-muted-foreground">
                    {item.supporting_evidence}
                  </span>
                ) : null}
                {item.run_ids?.length ? (
                  <span className="block text-xs text-muted-foreground">
                    {item.run_ids.length} referenced runs
                  </span>
                ) : null}
              </span>
              <Button size="sm" variant="ghost" onClick={() => onDeleteFinding(item.id)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-end gap-2">
          <select
            className="rounded border bg-background p-2 text-sm"
            value={findingType}
            onChange={(event) => setFindingType(event.target.value as "observed" | "inferred")}
            aria-label="Finding type"
          >
            <option value="observed">Observed</option>
            <option value="inferred">Inferred</option>
          </select>
          <Input
            className="min-w-64 flex-1"
            value={findingText}
            onChange={(event) => setFindingText(event.target.value)}
            placeholder="Finding"
            aria-label="Finding"
          />
          <Input
            className="min-w-64 flex-1"
            value={evidenceText}
            onChange={(event) => setEvidenceText(event.target.value)}
            placeholder="Supporting evidence"
            aria-label="Supporting evidence"
          />
          <Button
            variant="outline"
            disabled={busy || findingText.trim().length < 3}
            onClick={() => {
              onAddFinding({
                findingType,
                finding: findingText.trim(),
                supportingEvidence: evidenceText.trim(),
                runIds:
                  findingType === "observed"
                    ? detail.runs
                        .filter((run) => run.run_status === "success" && !run.is_test_connection)
                        .map((run) => run.id)
                    : [],
              });
              setFindingText("");
              setEvidenceText("");
            }}
          >
            Add finding
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Observed findings are facts supported by stored runs. Inferred findings are analyst
          interpretations and are never promoted to observed automatically. Correlation between two
          observations is not treated as causation.
        </p>
      </section>

      <section className="no-print grid gap-3 rounded border p-4">
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Manual import (labelled manual, never presented as an API response)
        </h3>
        <Input
          value={manual.label}
          onChange={(event) => setManual({ ...manual, label: event.target.value })}
          placeholder="Source label, e.g. ChatGPT session 2026-03-04"
          aria-label="Manual source label"
        />
        <Input
          value={manual.prompt}
          onChange={(event) => setManual({ ...manual, prompt: event.target.value })}
          placeholder="Prompt used"
          aria-label="Manual prompt"
        />
        <Textarea
          value={manual.response}
          onChange={(event) => setManual({ ...manual, response: event.target.value })}
          placeholder="Response text"
          rows={5}
          aria-label="Manual response"
        />
        <Textarea
          value={manual.sources}
          onChange={(event) => setManual({ ...manual, sources: event.target.value })}
          placeholder="Source URLs, one per line"
          rows={3}
          aria-label="Manual source URLs"
        />
        <Button
          variant="outline"
          disabled={busy || manual.response.trim().length === 0 || manual.prompt.trim().length < 3}
          onClick={() => {
            onImport({
              promptId: null,
              promptText: manual.prompt.trim(),
              responseText: manual.response.trim(),
              sourceUrls: manual.sources
                .split("\n")
                .map((url) => url.trim())
                .filter(Boolean),
              sourceLabel: manual.label.trim() || "manual",
            });
            setManual({ prompt: "", response: "", sources: "", label: "" });
          }}
        >
          Import response
        </Button>
      </section>

      <section className="no-print grid gap-3 rounded border p-4">
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Historical monitoring
        </h3>
        <div className="flex flex-wrap items-end gap-2">
          <select
            className="rounded border bg-background p-2 text-sm"
            value={compareWith}
            onChange={(event) => setCompareWith(event.target.value)}
            aria-label="Compare against"
          >
            <option value="">Compare this diagnostic against...</option>
            {rows
              .filter((row) => row.id !== diagnostic.id)
              .map((row) => (
                <option key={row.id} value={row.id}>
                  {row.diagnostic_number} {row.company_name}
                </option>
              ))}
          </select>
          <Button
            variant="outline"
            disabled={busy || !compareWith}
            onClick={() => onCompare(compareWith, diagnostic.id)}
          >
            Compare (selected as baseline)
          </Button>
        </div>
        {detail.comparisons.map((comparison) => (
          <pre
            key={comparison.id}
            className="max-h-72 overflow-auto rounded border bg-secondary/40 p-3 text-xs"
          >
            {JSON.stringify(comparison.comparison_results, null, 2)}
          </pre>
        ))}
      </section>

      <section className="no-print rounded border p-4 text-sm">
        <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          API usage and cost
        </h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              {["Provider", "Calls", "Input tokens", "Output tokens", "Estimated", "Actual"].map(
                (heading) => (
                  <th key={heading} className="py-2 pr-3 font-medium text-muted-foreground">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {detail.costSummary.byProvider.map((row) => (
              <tr key={row.provider} className="border-b">
                <td className="py-2 pr-3">{PROVIDER_LABELS[row.provider]}</td>
                <td className="py-2 pr-3">{row.calls}</td>
                <td className="py-2 pr-3">{row.inputTokens}</td>
                <td className="py-2 pr-3">{row.outputTokens}</td>
                <td className="py-2 pr-3">{money(row.estimatedUsd)}</td>
                <td className="py-2 pr-3">{money(row.actualUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-muted-foreground">
          Total estimated {money(detail.costSummary.totalEstimatedUsd)} / total actual{" "}
          {money(detail.costSummary.totalActualUsd)} for this diagnostic.
        </p>
      </section>

      <p className="text-xs text-muted-foreground">
        {MEASUREMENT_DISCLAIMER}
        {target ? ` Target measured over ${target.measuredRuns} successful runs.` : ""}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------

function MetricsTables({ detail }: { detail: Detail }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Recommendation visibility
      </h3>
      <p className="mb-3 text-xs text-muted-foreground">
        Measured runs {detail.metrics.measuredRuns} / failed {detail.metrics.failedRuns}. Failed runs
        are excluded from every denominator.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              {[
                "Brand",
                "Runs",
                "Appearances",
                "Visibility rate",
                "Top 3",
                "Top 3 rate",
                "First mentioned",
                "First rate",
                "Avg position",
                "Share of appearances",
              ].map((heading) => (
                <th key={heading} className="py-2 pr-3 font-medium text-muted-foreground">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detail.metrics.brands.map((brand) => (
              <tr key={brand.canonical} className="border-b">
                <td className="py-2 pr-3">
                  {brand.canonical}
                  {brand.isTarget ? " (target)" : ""}
                </td>
                <td className="py-2 pr-3">{brand.measuredRuns}</td>
                <td className="py-2 pr-3">{brand.appearances}</td>
                <td className="py-2 pr-3">{percent(brand.visibilityRate)}</td>
                <td className="py-2 pr-3">{brand.top3Appearances}</td>
                <td className="py-2 pr-3">{percent(brand.top3Rate)}</td>
                <td className="py-2 pr-3">{brand.firstMentionedCount}</td>
                <td className="py-2 pr-3">{percent(brand.firstMentionedRate)}</td>
                <td className="py-2 pr-3">{brand.averagePositionWhenMentioned ?? "-"}</td>
                <td className="py-2 pr-3">{percent(brand.shareOfAppearances)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 mt-6 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Provider breakdown
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              {["Brand", "Provider", "Runs", "Appearances", "Visibility rate", "Top 3", "First"].map(
                (heading) => (
                  <th key={heading} className="py-2 pr-3 font-medium text-muted-foreground">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {detail.metrics.brands.flatMap((brand) =>
              brand.byProvider.map((row) => (
                <tr key={`${brand.canonical}-${row.provider}`} className="border-b">
                  <td className="py-2 pr-3">{brand.canonical}</td>
                  <td className="py-2 pr-3">{PROVIDER_LABELS[row.provider as ProviderId]}</td>
                  <td className="py-2 pr-3">{row.measuredRuns}</td>
                  <td className="py-2 pr-3">{row.appearances}</td>
                  <td className="py-2 pr-3">{percent(row.visibilityRate)}</td>
                  <td className="py-2 pr-3">{row.top3Appearances}</td>
                  <td className="py-2 pr-3">{row.firstMentionedCount}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 mt-6 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Cited domains ({detail.metrics.totalCitations} citations)
      </h3>
      <ul className="grid gap-1 text-sm">
        {detail.metrics.citedDomains.slice(0, 40).map((entry) => (
          <li key={entry.domain}>
            {entry.domain} / {entry.frequency} citations /{" "}
            {entry.providers.map((provider) => PROVIDER_LABELS[provider as ProviderId]).join(", ")}
          </li>
        ))}
        {detail.metrics.citedDomains.length === 0 ? (
          <li className="text-muted-foreground">No citations stored yet.</li>
        ) : null}
      </ul>
      {detail.metrics.domainsSharedAcrossProviders.length ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Cited by more than one provider:{" "}
          {detail.metrics.domainsSharedAcrossProviders.map((entry) => entry.domain).join(", ")}
        </p>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------------

function ReportView({ detail }: { detail: Detail }) {
  const diagnostic = detail.diagnostic;
  const scored = detail.runs.filter((run) => !run.is_test_connection);
  const providers = Array.from(new Set(scored.map((run) => run.provider)));
  const models = Array.from(new Set(scored.map((run) => run.model_name)));
  const modes = Array.from(new Set(scored.map((run) => run.grounding_mode)));
  const observed = detail.findings.filter((item) => item.finding_type === "observed");
  const inferred = detail.findings.filter((item) => item.finding_type === "inferred");

  return (
    <article className="grid gap-8 text-sm">
      <div className="no-print">
        <Button variant="outline" onClick={() => window.print()}>
          Print or save as PDF
        </Button>
      </div>

      <header className="border-b pb-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Buyerfront / AI visibility diagnostic
        </p>
        <h2 className="font-serif text-2xl">{diagnostic.company_name}</h2>
        <p className="text-muted-foreground">
          {diagnostic.website} / {diagnostic.market}
        </p>
        <p className="text-xs text-muted-foreground">
          {diagnostic.diagnostic_number} / {DIAGNOSTIC_TYPE_LABELS[diagnostic.diagnostic_type]} /
          measured {diagnostic.completed_at ? new Date(diagnostic.completed_at).toLocaleString() : "in progress"}
        </p>
      </header>

      <section>
        <h3 className="font-serif text-lg">Methodology</h3>
        <p>
          {detail.prompts.filter((prompt) => prompt.enabled).length} buyer-intent prompts were run
          against {providers.length} provider{providers.length === 1 ? "" : "s"} (
          {providers.map((provider) => PROVIDER_LABELS[provider]).join(", ") || "none"}). Models:{" "}
          {models.join(", ") || "none"}. Grounding or search mode: {modes.join(", ") || "none"}. Every
          raw response, citation and source URL is retained so each measurement can be audited.
        </p>
      </section>

      <MetricsTables detail={detail} />

      <section>
        <h3 className="font-serif text-lg">Observed findings</h3>
        <ul className="ml-4 list-disc">
          {observed.map((item) => (
            <li key={item.id}>
              {item.finding}
              {item.supporting_evidence ? ` (${item.supporting_evidence})` : ""}
            </li>
          ))}
          {observed.length === 0 ? <li>No observed findings recorded.</li> : null}
        </ul>
      </section>

      <section>
        <h3 className="font-serif text-lg">Inferred findings and analyst recommendations</h3>
        <p className="text-xs text-muted-foreground">
          Interpretations and hypotheses. These are not measurements and no causal relationship is
          claimed.
        </p>
        <ul className="ml-4 list-disc">
          {inferred.map((item) => (
            <li key={item.id}>
              {item.finding}
              {item.supporting_evidence ? ` (${item.supporting_evidence})` : ""}
            </li>
          ))}
          {inferred.length === 0 ? <li>No inferred findings recorded.</li> : null}
        </ul>
      </section>

      <section className="border-t pt-4 text-xs text-muted-foreground">
        <h3 className="font-serif text-base text-foreground">Methodology and limitations</h3>
        <p>{MEASUREMENT_DISCLAIMER}</p>
        <p>
          AI responses are probabilistic and change over time. Buyerfront does not guarantee
          rankings, citations or recommendations. Where {detail.metrics.failedRuns} run
          {detail.metrics.failedRuns === 1 ? "" : "s"} failed, those runs are excluded from all rates
          rather than counted as an absence of appearance.
        </p>
      </section>
    </article>
  );
}
