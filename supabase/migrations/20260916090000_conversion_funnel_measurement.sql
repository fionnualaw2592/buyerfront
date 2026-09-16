ALTER TABLE public.snapshot_leads
  ADD COLUMN utm_source TEXT,
  ADD COLUMN utm_medium TEXT,
  ADD COLUMN utm_campaign TEXT,
  ADD COLUMN utm_content TEXT,
  ADD COLUMN landing_path TEXT,
  ADD COLUMN referrer_domain TEXT;

CREATE TABLE public.funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL CHECK (event_name IN (
    'landing_page_view',
    'snapshot_cta_click',
    'snapshot_form_start',
    'snapshot_validation_failure',
    'snapshot_submission_success'
  )),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  landing_path TEXT NOT NULL,
  referrer_domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX funnel_events_name_created_at_idx
  ON public.funnel_events (event_name, created_at DESC);

CREATE INDEX funnel_events_created_at_idx
  ON public.funnel_events (created_at);

CREATE INDEX funnel_events_campaign_created_at_idx
  ON public.funnel_events (utm_campaign, created_at DESC);

CREATE FUNCTION public.prune_expired_funnel_events()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.funnel_events
  WHERE created_at < now() - INTERVAL '12 months';
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.prune_expired_funnel_events() FROM PUBLIC;

CREATE TRIGGER prune_expired_funnel_events_after_insert
  AFTER INSERT ON public.funnel_events
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.prune_expired_funnel_events();

REVOKE ALL ON public.funnel_events FROM anon, authenticated;
GRANT ALL ON public.funnel_events TO service_role;

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public access to funnel events"
  ON public.funnel_events
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
