export function SiteFooter() {
  return (
    <footer className="rule-top">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-lg tracking-tight">[BRAND]</p>
            <p className="eyebrow mt-2">AI Buyer Intelligence &amp; Growth</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-3">
            <a href="#proof" className="text-sm text-muted-foreground hover:text-foreground">
              Proof
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
              How it works
            </a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
              FAQ
            </a>
            <a href="#snapshot" className="text-sm text-muted-foreground hover:text-foreground">
              Free snapshot
            </a>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Company name, registration and legal details are pending. [BRAND] is a temporary working
            name.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <a
                href="#snapshot"
                className="text-xs text-muted-foreground underline decoration-hairline underline-offset-4 hover:text-foreground"
              >
                Privacy notice (placeholder)
              </a>
            </li>
            <li>
              <a
                href="#snapshot"
                className="text-xs text-muted-foreground underline decoration-hairline underline-offset-4 hover:text-foreground"
              >
                Terms (placeholder)
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
