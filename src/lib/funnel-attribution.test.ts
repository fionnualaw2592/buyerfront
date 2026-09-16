import { describe, expect, test } from "bun:test";

import { captureFunnelAttribution } from "./funnel-attribution";

describe("funnel attribution", () => {
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
