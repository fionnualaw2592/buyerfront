import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocation } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "#ai-visibility", label: "AI Visibility" },
  { href: "#ai-workflows", label: "AI Workflows" },
  { href: "#how-we-work", label: "How We Work" },
];

function useHomeAnchors() {
  const { pathname } = useLocation();
  const prefix = pathname === "/privacy" ? "/" : "";
  return {
    home: prefix || "#top",
    section: (href: string) => `${prefix}${href}`,
  };
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const anchors = useHomeAnchors();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-b border-hairline bg-background/90 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 sm:h-16 sm:px-8">
        <a
          href={anchors.home}
          className="font-display text-lg tracking-tight text-foreground sm:text-xl"
          aria-label="Buyerfront home"
        >
          Buyerfront
          <span className="ml-2 hidden align-middle font-mono text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase lg:inline">
            AI visibility
          </span>
        </a>

        <nav aria-label="Main" className="hidden items-center gap-5 md:flex lg:gap-7">
          {links.map((l) => (
            <a
              key={l.href}
              href={anchors.section(l.href)}
              className="relative text-sm text-muted-foreground transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-signal after:transition-all after:duration-300 hover:text-foreground hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
          <Button asChild variant="cta" size="default">
            <a href={anchors.section("#snapshot")}>Get a Free AI Visibility Snapshot</a>
          </Button>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-hairline bg-background px-5 pt-2 pb-6 md:hidden"
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {links.map((l) => (
            <a
              key={l.href}
              href={anchors.section(l.href)}
              onClick={() => setOpen(false)}
              className="border-b border-border py-3.5 text-base text-foreground"
            >
              {l.label}
            </a>
          ))}
          <Button asChild variant="cta" size="xl" className="mt-5 w-full">
            <a href={anchors.section("#snapshot")} onClick={() => setOpen(false)}>
              Get Your Free AI Visibility Snapshot
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
