import { describe, expect, test } from "bun:test";

import { captureFunnelAttribution, campaignSearch, FUNNEL_EVENT_NAMES } from "./funnel-attribution";

describe("funnel attribution", () => {
  test("preserves the four supported campaign values from sample to enquiry without forwarding personal data", () => {
    const original = captureFunnelAttribution({ locationHref: "https://buyerfront.ie/onboarding-handoff-checklist?utm_source=linkedin&utm_medium=organic&utm_campaign=handoff&utm_content=sample&email=private@example.com", referrer: "" });
    const search = campaignSearch(original);
    expect(search).toEqual({ utm_source: "linkedin", utm_medium: "organic", utm_campaign: "handoff", utm_content: "sample" });
    const reloaded = captureFunnelAttribution({ locationHref: `https://buyerfront.ie/?${new URLSearchParams(search)}#onboarding-check`, referrer: "https://buyerfront.ie/onboarding-handoff-checklist" });
    expect(reloaded.utmCampaign).toBe("handoff");
    expect(original.landingPath).toBe("/onboarding-handoff-checklist");
  });

  test("accepts all three sample events and retains existing snapshot events", () => {
    expect(FUNNEL_EVENT_NAMES).toContain("sample_view");
    expect(FUNNEL_EVENT_NAMES).toContain("sample_print");
    expect(FUNNEL_EVENT_NAMES).toContain("sample_enquiry_click");
    expect(FUNNEL_EVENT_NAMES).toContain("snapshot_submission_success");
  });

  test("captures campaign values, landing path and external referrer domain", () => {
    expect(
      captureFunnelAttribution({
        locationHref:
          "https://buyerfront.ie/?utm_source=linkedin&utm_medium=paid-social&utm_campaign=launch&utm_content=founder-ad&email=private@example.com",
        referrer: "https://www.linkedin.com/feed/",
      }),
    ).toEqual({
      utmSource: "linkedin",
      utmMedium: "paid-social",
      utmCampaign: "launch",
      utmContent: "founder-ad",
      landingPath: "/",
      referrerDomain: "linkedin.com",
    });
  });

  test("does not retain arbitrary query parameters or same-site referrers", () => {
    expect(
      captureFunnelAttribution({
        locationHref: "https://buyerfront.ie/privacy?email=private@example.com",
        referrer: "https://buyerfront.ie/",
      }),
    ).toEqual({
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      landingPath: "/privacy",
      referrerDomain: null,
    });
  });

  test("sanitizes campaign values and ignores malformed referrers", () => {
    const attribution = captureFunnelAttribution({
      locationHref: "https://buyerfront.ie/?utm_source=%20partner%0Anewsletter%20",
      referrer: "not-a-url",
    });

    expect(attribution.utmSource).toBe("partner newsletter");
    expect(attribution.referrerDomain).toBeNull();
  });
});
