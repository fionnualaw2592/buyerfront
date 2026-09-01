CREATE TABLE public.snapshot_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  website TEXT NOT NULL,
  sells TEXT NOT NULL,
  competitor TEXT,
  notified BOOLEAN NOT NULL DEFAULT false,
  notify_error TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.snapshot_leads TO service_role;

ALTER TABLE public.snapshot_leads ENABLE ROW LEVEL SECURITY;

CREATE INDEX snapshot_leads_created_at_idx ON public.snapshot_leads (created_at DESC);
CREATE INDEX snapshot_leads_email_created_at_idx ON public.snapshot_leads (email, created_at DESC);