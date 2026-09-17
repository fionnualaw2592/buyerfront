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
            <a
              href="/#ai-visibility"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              AI Visibility
            </a>
            <Link
              to="/revenue-leakage"
              data-revenue-leakage-cta
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Revenue Leakage
            </Link>
            <a href="/#ai-workflows" className="text-sm text-muted-foreground hover:text-foreground">
              AI Workflows
            </a>
            <a href="/#how-we-work" className="text-sm text-muted-foreground hover:text-foreground">
              How we work
            </a>
            <a href="/#faq" className="text-sm text-muted-foreground hover:text-foreground">
              FAQ
            </a>
            <a
              href="/#snapshot"
              data-snapshot-cta
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Get My Free AI Visibility Snapshot
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
            &copy; {new Date().getFullYear()} Buyerfront. AI answers are probabilistic, so we
            measure, diagnose and improve rather than promise rankings.
          </p>
          <a
            href="/#snapshot"
            data-snapshot-cta
            className="text-xs text-muted-foreground underline decoration-hairline underline-offset-4 hover:text-foreground"
          >
            Get My Free AI Visibility Snapshot
          </a>
        </div>
      </div>
    </footer>
  );
}
