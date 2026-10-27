ALTER TABLE public.funnel_events DROP CONSTRAINT funnel_events_event_name_check;
ALTER TABLE public.funnel_events ADD CONSTRAINT funnel_events_event_name_check CHECK (event_name IN ('landing_page_view', 'snapshot_cta_click', 'snapshot_form_start', 'snapshot_validation_failure', 'snapshot_submission_success', 'sample_view', 'sample_print', 'sample_enquiry_click'));
