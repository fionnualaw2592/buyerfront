import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useLocation } from "@tanstack/react-router";

import {
  captureBrowserAttribution,
  type FunnelAttribution,
  type FunnelEventName,
} from "@/lib/funnel-attribution";
import { trackFunnelEvent } from "@/lib/funnel.functions";

type FunnelAnalytics = {
  attribution: FunnelAttribution;
  track: (eventName: FunnelEventName) => void;
};

const FunnelAnalyticsContext = createContext<FunnelAnalytics | null>(null);

export function FunnelAnalyticsProvider({ children }: { children: ReactNode }) {
  const sendEvent = useServerFn(trackFunnelEvent);
  const attributionRef = useRef(captureBrowserAttribution());
  const pageViewsSent = useRef(new Set<string>());
  const { pathname } = useLocation();

  const track = useCallback(
    (eventName: FunnelEventName) => {
      void sendEvent({
        data: { eventName, attribution: attributionRef.current },
      }).catch(() => {
        // Measurement must never block the visitor's primary task.
      });
    },
    [sendEvent],
  );

  useEffect(() => {
    if (!pageViewsSent.current.has(pathname)) {
      pageViewsSent.current.add(pathname);
      track("landing_page_view");
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-onboarding-cta]")) {
        track("snapshot_cta_click");
        return;
      }
      if (target.closest("[data-revenue-leakage-cta]")) {
        track("snapshot_cta_click");
        return;
      }
      if (target.closest("[data-snapshot-cta]")) {
        track("snapshot_cta_click");
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [track, pathname]);

  return (
    <FunnelAnalyticsContext.Provider value={{ attribution: attributionRef.current, track }}>
      {children}
    </FunnelAnalyticsContext.Provider>
  );
}

// This hook intentionally shares the provider's module so they cannot drift apart.
// eslint-disable-next-line react-refresh/only-export-components
export function useFunnelAnalytics(): FunnelAnalytics {
  const analytics = useContext(FunnelAnalyticsContext);
  if (!analytics) throw new Error("useFunnelAnalytics must be used within FunnelAnalyticsProvider");
  return analytics;
}
