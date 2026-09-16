export const FUNNEL_EVENT_NAMES = [
  "landing_page_view",
  "snapshot_cta_click",
  "snapshot_form_start",
  "snapshot_validation_failure",
  "snapshot_submission_success",
] as const;

export type FunnelEventName = (typeof FUNNEL_EVENT_NAMES)[number];

export type FunnelAttribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  landingPath: string;
  referrerDomain: string | null;
};

const MAX_CAMPAIGN_LENGTH = 160;
const MAX_PATH_LENGTH = 500;

function clean(value: string | null, maxLength: number): string | null {
  if (!value) return null;
  const sanitized = [...value]
    .map((character) => {
      const code = character.charCodeAt(0);
      return code <= 31 || code === 127 ? " " : character;
    })
    .join("")
    .trim()
    .slice(0, maxLength);
  return sanitized || null;
}

export function captureFunnelAttribution({
  locationHref,
  referrer,
}: {
  locationHref: string;
  referrer: string;
}): FunnelAttribution {
  let landingUrl: URL;
  try {
    landingUrl = new URL(locationHref);
  } catch {
    landingUrl = new URL("https://buyerfront.ie/");
  }

  let referrerDomain: string | null = null;
  if (referrer) {
    try {
      const referrerUrl = new URL(referrer);
      if (referrerUrl.hostname !== landingUrl.hostname) {
        referrerDomain = clean(referrerUrl.hostname.toLowerCase().replace(/^www\./, ""), 253);
      }
    } catch {
      referrerDomain = null;
    }
  }

  return {
    utmSource: clean(landingUrl.searchParams.get("utm_source"), MAX_CAMPAIGN_LENGTH),
    utmMedium: clean(landingUrl.searchParams.get("utm_medium"), MAX_CAMPAIGN_LENGTH),
    utmCampaign: clean(landingUrl.searchParams.get("utm_campaign"), MAX_CAMPAIGN_LENGTH),
    utmContent: clean(landingUrl.searchParams.get("utm_content"), MAX_CAMPAIGN_LENGTH),
    landingPath: clean(landingUrl.pathname, MAX_PATH_LENGTH) ?? "/",
    referrerDomain,
  };
}

export function captureBrowserAttribution(): FunnelAttribution {
  if (typeof window === "undefined") {
    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      landingPath: "/",
      referrerDomain: null,
    };
  }

  return captureFunnelAttribution({
    locationHref: window.location.href,
    referrer: document.referrer,
  });
}
