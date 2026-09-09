REVOKE ALL ON public.snapshot_leads FROM anon, authenticated;
GRANT ALL ON public.snapshot_leads TO service_role;
ALTER TABLE public.snapshot_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No public access to snapshot leads" ON public.snapshot_leads;
CREATE POLICY "No public access to snapshot leads" ON public.snapshot_leads AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);