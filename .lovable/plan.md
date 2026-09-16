# Snapshot submission: diagnosis (no code change needed)

## What the live data shows

The failure described has already stopped happening — the fix published earlier is live and working.

Evidence gathered just now from production:

- Live form submissions on buyerfront.ie at 21:49:58 and 21:52:47 UTC both succeeded and are saved as leads.
- Both of those leads were emailed successfully (marked notified, no error recorded).
- Visit and click tracking is recording again: 4 page views, 3 form starts, 2 successful submissions, 1 validation warning.
- The live server returned success (200) for all three form-related requests in that window; there are no errors in the production logs.

So: the database write works, the tracking write works, and the email notification works.

## Root cause of the earlier failure

An unused sign-in step was configured to run before every form submission. It tried to build a signed-in database connection using settings that are not present in the published browser code, so it threw an error and the request never left the visitor's browser. That explains all three symptoms at once: page loaded fine, generic error shown, and no lead or tracking row created.

That step was removed and published. The successful live submissions above confirm it.

## The one older failure, for completeness

The oldest lead (1 September, hello@buyerfront.ie) was saved but not emailed, because at that time the sending domain was not yet verified. The domain is verified now, and the two recent leads emailed without error. Nothing to fix.

## Smallest safe fix

None required. No code change is proposed.

If the smoke test still shows the error message for you, it is a cached copy of the page in your browser: hard-refresh buyerfront.ie (or open it in a private window) and submit once more.

## Optional housekeeping

Two test entries created during verification are sitting in your data:

- smoke@example.com
- smoke2@example.com

plus their matching tracking rows. Say the word and I will delete them; otherwise they stay untouched.
