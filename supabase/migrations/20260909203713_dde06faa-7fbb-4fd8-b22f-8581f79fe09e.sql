WITH d AS (
  INSERT INTO public.diagnostics (
    diagnostic_number, company_name, website, market, diagnostic_type, status, notes
  ) VALUES (
    'BF-D001',
    'CRM software category (internal experiment)',
    'https://buyerfront.ie/',
    'Global',
    'snapshot',
    'draft',
    'Draft shell for the internal AI Buyer Visibility Snapshot #001 (CRM software), observed September 2026. Populated ONLY from information already verified in this project: the published share-of-observed-citation-mentions figures, the evidence source categories, and the observed period. MISSING VERIFIED EVIDENCE, deliberately not reconstructed: (1) the exact prompt set used, (2) the raw AI responses, (3) the citation lists and source URLs, (4) per-response mention positions and first-mention data, (5) the measured-run denominators behind the percentages, (6) which providers, models and grounding modes were used, (7) any Salesflare or Pipedrive head-to-head measurement, which does not exist in this project database. No runs are stored, so no metric in this diagnostic is machine derived.'
  ) RETURNING id
)
INSERT INTO public.diagnostic_competitors (diagnostic_id, competitor_name, competitor_website, aliases)
SELECT d.id, v.name, v.site, v.aliases
FROM d, (VALUES
  ('HubSpot', 'https://www.hubspot.com', ARRAY['HubSpot CRM','Hub Spot']),
  ('Salesforce', 'https://www.salesforce.com', ARRAY['Salesforce CRM','Sales Cloud']),
  ('Pipedrive', 'https://www.pipedrive.com', ARRAY['Pipedrive CRM']),
  ('Zoho CRM', 'https://www.zoho.com/crm/', ARRAY['Zoho'])
) AS v(name, site, aliases);

INSERT INTO public.diagnostic_findings (diagnostic_id, finding_type, finding, supporting_evidence)
SELECT id, 'observed', v.finding, v.evidence
FROM public.diagnostics, (VALUES
  (
    'Across the recorded Snapshot #001 CRM buyer-intent question set, four brands absorbed most observed citation mentions: HubSpot 38.8 percent, Salesforce 14.4 percent, Pipedrive 13.7 percent and Zoho CRM 11.5 percent.',
    'Source: Buyerfront published Snapshot #001 summary, observed September 2026. Underlying raw responses and per-run denominators are not retained in this project, so these figures cannot be recomputed from stored evidence.'
  ),
  (
    'Observed citation evidence came from five source categories: the brand''s own domain, independent publishers, communities, comparison content and other third-party sources.',
    'Source: Buyerfront published Snapshot #001 summary. Individual source URLs are not retained in this project.'
  ),
  (
    'The measurement period recorded for Snapshot #001 is September 2026, using a fixed set of CRM buyer-intent questions.',
    'Source: Buyerfront published Snapshot #001 methodology note. The exact prompt texts are not retained in this project.'
  )
) AS v(finding, evidence)
WHERE diagnostic_number = 'BF-D001';