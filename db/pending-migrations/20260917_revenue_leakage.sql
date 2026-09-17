-- Revenue Leakage Snapshot storage and funnel events.
-- STATUS: prepared for review only. NOT applied to production.
-- Apply with the database migration tool once approved.

CREATE TABLE IF NOT EXISTS public.revenue_leakage_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  website text NOT NULL,
  sells text NOT NULL,
  enquiry_process text NOT NULL,
  stuck_points text,
  notified boolean NOT NULL DEFAULT false,
  notify_error text,
  user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  landing_path text,
  referrer_domain text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS revenue_leakage_leads_email_created_at_idx
  ON public.revenue_leakage_leads (email, created_at DESC);

-- Server-side service role only, mirroring public.snapshot_leads.
REVOKE ALL ON public.revenue_leakage_leads FROM anon;
REVOKE ALL ON public.revenue_leakage_leads FROM authenticated;
GRANT ALL ON public.revenue_leakage_leads TO service_role;

ALTER TABLE public.revenue_leakage_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to revenue leakage leads"
  ON public.revenue_leakage_leads
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Extend the allowed funnel event names. Existing values stay valid, no rows change.
ALTER TABLE public.funnel_events
  DROP CONSTRAINT IF EXISTS funnel_events_event_name_check;

ALTER TABLE public.funnel_events
  ADD CONSTRAINT funnel_events_event_name_check CHECK (
    event_name = ANY (ARRAY[
      'landing_page_view'::text,
      'snapshot_cta_click'::text,
      'snapshot_form_start'::text,
      'snapshot_validation_failure'::text,
      'snapshot_submission_success'::text,
      'revenue_leakage_page_view'::text,
      'revenue_leakage_cta_click'::text,
      'revenue_leakage_form_start'::text,
      'revenue_leakage_validation_failure'::text,
      'revenue_leakage_submission_success'::text
    ])
  );
