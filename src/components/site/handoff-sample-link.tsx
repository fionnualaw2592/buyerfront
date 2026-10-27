import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { campaignSearch } from "@/lib/funnel-attribution";
import { useFunnelAnalytics } from "@/components/site/funnel-analytics";

export function HandoffSampleLink({ enquiry = false, className, children }: { enquiry?: boolean; className?: string; children: ReactNode }) {
  const { attribution, track } = useFunnelAnalytics();
  const [search, setSearch] = useState<Record<string, string>>({});
  useEffect(() => { setSearch(campaignSearch(attribution)); }, [attribution]);
  return (
    <Link to={enquiry ? "/" : "/onboarding-handoff-checklist"} search={() => search} hash={enquiry ? "onboarding-check" : undefined} className={className} onClick={() => { if (enquiry) track("sample_enquiry_click"); }}>
      {children}
    </Link>
  );
}