-- Enums
CREATE TYPE public.diagnostic_type AS ENUM ('mini_signal', 'snapshot', 'deep_dive', 'monitoring');
CREATE TYPE public.diagnostic_status AS ENUM ('draft', 'ready', 'running', 'complete', 'partial', 'failed', 'archived');
CREATE TYPE public.diagnostic_provider AS ENUM ('openai', 'google', 'perplexity', 'manual');
CREATE TYPE public.diagnostic_run_status AS ENUM ('success', 'failed', 'skipped');
CREATE TYPE public.diagnostic_finding_type AS ENUM ('observed', 'inferred');

-- diagnostics
CREATE TABLE public.diagnostics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_number text NOT NULL UNIQUE,
  company_name text NOT NULL,
  website text NOT NULL,
  market text NOT NULL DEFAULT 'Global',
  diagnostic_type public.diagnostic_type NOT NULL DEFAULT 'snapshot',
  status public.diagnostic_status NOT NULL DEFAULT 'draft',
  target_aliases text[] NOT NULL DEFAULT '{}',
  provider_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  max_estimated_cost_usd numeric NOT NULL DEFAULT 2.00,
  max_provider_calls integer NOT NULL DEFAULT 60,
  baseline_diagnostic_id uuid REFERENCES public.diagnostics(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.diagnostic_competitors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_id uuid NOT NULL REFERENCES public.diagnostics(id) ON DELETE CASCADE,
  competitor_name text NOT NULL,
  competitor_website text,
  aliases text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX diagnostic_competitors_diagnostic_idx ON public.diagnostic_competitors(diagnostic_id);

CREATE TABLE public.diagnostic_prompts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_id uuid NOT NULL REFERENCES public.diagnostics(id) ON DELETE CASCADE,
  prompt_number integer NOT NULL,
  prompt_text text NOT NULL,
  intent_type text NOT NULL DEFAULT 'high_intent',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (diagnostic_id, prompt_number)
);
CREATE INDEX diagnostic_prompts_diagnostic_idx ON public.diagnostic_prompts(diagnostic_id);

CREATE TABLE public.diagnostic_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_id uuid NOT NULL REFERENCES public.diagnostics(id) ON DELETE CASCADE,
  prompt_id uuid REFERENCES public.diagnostic_prompts(id) ON DELETE SET NULL,
  prompt_text text NOT NULL DEFAULT '',
  provider public.diagnostic_provider NOT NULL,
  model_name text NOT NULL,
  model_version text,
  grounding_mode text NOT NULL DEFAULT 'unknown',
  run_timestamp timestamptz NOT NULL DEFAULT now(),
  raw_response text,
  raw_payload jsonb,
  citations_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_urls_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  run_status public.diagnostic_run_status NOT NULL DEFAULT 'success',
  error_message text,
  input_tokens integer,
  output_tokens integer,
  search_calls integer,
  estimated_cost_usd numeric,
  actual_cost_usd numeric,
  is_test_connection boolean NOT NULL DEFAULT false,
  is_manual_import boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX diagnostic_runs_diagnostic_idx ON public.diagnostic_runs(diagnostic_id);
CREATE INDEX diagnostic_runs_prompt_idx ON public.diagnostic_runs(prompt_id);

CREATE TABLE public.diagnostic_mentions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES public.diagnostic_runs(id) ON DELETE CASCADE,
  brand_name text NOT NULL,
  canonical_brand_name text NOT NULL,
  mention_position integer NOT NULL,
  character_offset integer,
  is_target_brand boolean NOT NULL DEFAULT false,
  is_competitor boolean NOT NULL DEFAULT false,
  is_top_3 boolean NOT NULL DEFAULT false,
  is_first_mentioned boolean NOT NULL DEFAULT false,
  recommendation_context text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX diagnostic_mentions_run_idx ON public.diagnostic_mentions(run_id);

CREATE TABLE public.diagnostic_findings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_id uuid NOT NULL REFERENCES public.diagnostics(id) ON DELETE CASCADE,
  finding_type public.diagnostic_finding_type NOT NULL,
  finding text NOT NULL,
  supporting_evidence text,
  run_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX diagnostic_findings_diagnostic_idx ON public.diagnostic_findings(diagnostic_id);

CREATE TABLE public.diagnostic_sources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_id uuid NOT NULL REFERENCES public.diagnostics(id) ON DELETE CASCADE,
  run_id uuid REFERENCES public.diagnostic_runs(id) ON DELETE CASCADE,
  source_url text NOT NULL,
  domain text NOT NULL,
  provider public.diagnostic_provider NOT NULL,
  citation_position integer,
  frequency integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX diagnostic_sources_diagnostic_idx ON public.diagnostic_sources(diagnostic_id);

CREATE TABLE public.diagnostic_monitoring_comparisons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  baseline_diagnostic_id uuid NOT NULL REFERENCES public.diagnostics(id) ON DELETE CASCADE,
  comparison_diagnostic_id uuid NOT NULL REFERENCES public.diagnostics(id) ON DELETE CASCADE,
  comparison_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  comparison_results jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX diagnostic_comparisons_baseline_idx ON public.diagnostic_monitoring_comparisons(baseline_diagnostic_id);

-- Grants: diagnostic data is server-side/admin only. No anon or authenticated access.
GRANT ALL ON public.diagnostics TO service_role;
GRANT ALL ON public.diagnostic_competitors TO service_role;
GRANT ALL ON public.diagnostic_prompts TO service_role;
GRANT ALL ON public.diagnostic_runs TO service_role;
GRANT ALL ON public.diagnostic_mentions TO service_role;
GRANT ALL ON public.diagnostic_findings TO service_role;
GRANT ALL ON public.diagnostic_sources TO service_role;
GRANT ALL ON public.diagnostic_monitoring_comparisons TO service_role;

REVOKE ALL ON public.diagnostics FROM anon, authenticated;
REVOKE ALL ON public.diagnostic_competitors FROM anon, authenticated;
REVOKE ALL ON public.diagnostic_prompts FROM anon, authenticated;
REVOKE ALL ON public.diagnostic_runs FROM anon, authenticated;
REVOKE ALL ON public.diagnostic_mentions FROM anon, authenticated;
REVOKE ALL ON public.diagnostic_findings FROM anon, authenticated;
REVOKE ALL ON public.diagnostic_sources FROM anon, authenticated;
REVOKE ALL ON public.diagnostic_monitoring_comparisons FROM anon, authenticated;

ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_monitoring_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to diagnostics" ON public.diagnostics
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No public access to diagnostic competitors" ON public.diagnostic_competitors
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No public access to diagnostic prompts" ON public.diagnostic_prompts
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No public access to diagnostic runs" ON public.diagnostic_runs
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No public access to diagnostic mentions" ON public.diagnostic_mentions
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No public access to diagnostic findings" ON public.diagnostic_findings
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No public access to diagnostic sources" ON public.diagnostic_sources
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No public access to diagnostic comparisons" ON public.diagnostic_monitoring_comparisons
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE TRIGGER update_diagnostics_updated_at
  BEFORE UPDATE ON public.diagnostics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();