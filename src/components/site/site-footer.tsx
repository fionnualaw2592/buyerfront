export function SiteFooter() {
  return (
    <footer className="rule-top">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-lg tracking-tight">Buyerfront</p>
            <p className="eyebrow mt-2">AI visibility for the new buyer journey</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-3">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
              How it works
            </a>
            <a href="#analyse" className="text-sm text-muted-foreground hover:text-foreground">
              What we analyse
            </a>
            <a href="#services" className="text-sm text-muted-foreground hover:text-foreground">
              Services
            </a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
              FAQ
            </a>
            <a href="#snapshot" className="text-sm text-muted-foreground hover:text-foreground">
              Free snapshot
            </a>
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
            &copy; {new Date().getFullYear()} Buyerfront. AI answers are probabilistic, so we measure,
            diagnose and improve rather than promise rankings.
          </p>
          <a
            href="#snapshot"
            className="text-xs text-muted-foreground underline decoration-hairline underline-offset-4 hover:text-foreground"
          >
            Request a free snapshot
          </a>
        </div>
      </div>
    </footer>
  );
}
