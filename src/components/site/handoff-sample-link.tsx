import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { campaignSearch } from "@/lib/funnel-attribution";
import { useFunnelAnalytics } from "@/components/site/funnel-analytics";

export function HandoffSampleLink({ enquiry = false, className, children }: { enquiry?: boolean; className?: string; children: ReactNode }) {
  const { attribution, track } = useFunnelAnalytics();
  const { pathname } = useLocation();
  const [search, setSearch] = useState<Record<string, string>>({});
  useEffect(() => { setSearch(campaignSearch(attribution)); }, [attribution]);
  return (
    <Link to={enquiry ? "/" : "/onboarding-handoff-checklist"} search={() => search} hash={enquiry ? "onboarding-check" : ""} className={className} onClick={() => { if (enquiry) track(pathname === "/onboarding-handoff-checklist" ? "sample_enquiry_click" : "snapshot_cta_click"); }}>
      {children}
    </Link>
  );
}