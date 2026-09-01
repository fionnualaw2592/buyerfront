CREATE TYPE public.social_platform AS ENUM ('linkedin', 'tiktok');
CREATE TYPE public.social_content_type AS ENUM ('experiment', 'market_evidence', 'ai_discovery_test', 'prospect_signal');
CREATE TYPE public.social_status AS ENUM ('draft', 'approved', 'scheduled', 'published', 'failed', 'cancelled');
CREATE TYPE public.tiktok_publish_mode AS ENUM ('direct_publish', 'notification_publish');

CREATE TABLE public.social_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_number text NOT NULL UNIQUE,
  title text NOT NULL,
  reference text,
  platform public.social_platform NOT NULL,
  content_type public.social_content_type NOT NULL DEFAULT 'experiment',
  hook text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  asset_url text,
  buffer_channel_id text NOT NULL,
  tiktok_publish_mode public.tiktok_publish_mode,
  status public.social_status NOT NULL DEFAULT 'draft',
  scheduled_for timestamptz,
  buffer_post_id text,
  published_at timestamptz,
  last_error text,
  views integer,
  impressions integer,
  likes integer,
  comments integer,
  shares integer,
  clicks integer,
  snapshot_leads_attributed integer NOT NULL DEFAULT 0,
  paid_conversions_attributed integer NOT NULL DEFAULT 0,
  revenue_attributed numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.social_content TO service_role;

ALTER TABLE public.social_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to social content"
  ON public.social_content FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_social_content_updated_at
  BEFORE UPDATE ON public.social_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.social_content
  (content_number, title, platform, content_type, hook, caption, buffer_channel_id, tiktok_publish_mode, status)
VALUES
  ('BF-TEST-LI', 'Test row (LinkedIn)', 'linkedin', 'experiment',
   'Internal test hook, not for publishing.',
   'Internal test row used to verify the publishing pipeline. Not for publishing.',
   '6a974db0065799be466d2901', NULL, 'draft'),
  ('BF-TEST-TT', 'Test row (TikTok)', 'tiktok', 'experiment',
   'Internal test hook, not for publishing.',
   'Internal test row used to verify the publishing pipeline. Not for publishing.',
   '6a974dd1065799be466d2dca', 'notification_publish', 'draft');