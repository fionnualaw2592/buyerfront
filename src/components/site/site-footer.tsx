import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="rule-top">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-lg tracking-tight">Buyerfront</p>
            <p className="eyebrow mt-2">Find where revenue is being lost, then fix it</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-3">
            <a href="/#problem" className="text-sm text-muted-foreground hover:text-foreground">The Problem</a>
            <a href="/#rescue-sprint" className="text-sm text-muted-foreground hover:text-foreground">Rescue Sprint</a>
            <Link
              to="/revenue-leakage"
              data-revenue-leakage-cta
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Client Onboarding
            </Link>
            <a href="/#who-its-for" className="text-sm text-muted-foreground hover:text-foreground">
              Who It's For
            </a>
            <a href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
              How It Works
            </a>
            <a href="/#faq" className="text-sm text-muted-foreground hover:text-foreground">
              FAQ
            </a>
            <a
              href="/#onboarding-check"
              data-onboarding-cta
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Get My Free Onboarding Leak Check
            </a>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <a
              href="mailto:hello@buyerfront.ie"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              hello@buyerfront.ie
            </a>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-muted-foreground">
            &copy; {new Date().getFullYear()} Buyerfront. Clearer handoffs, better starts.
          </p>
          <a
            href="/#onboarding-check"
            data-onboarding-cta
            className="text-xs text-muted-foreground underline decoration-hairline underline-offset-4 hover:text-foreground"
          >
            Get My Free Onboarding Leak Check
          </a>
        </div>
      </div>
    </footer>
  );
}
