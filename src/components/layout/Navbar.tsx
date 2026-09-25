"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { TopBar } from "@/components/layout/TopBar";
import { useAuth, roleHomePath } from "@/context/auth-context";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-tutors", label: "For tutors" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  // Keying by pathname remounts the menu (resetting isOpen to false) on navigation, with no
  // effect or ref needed to reset it manually.
  return (
    <>
      <TopBar />
      <NavbarContent key={pathname} pathname={pathname} />
    </>
  );
}

function NavbarContent({ pathname }: { pathname: string }) {
  const { user, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/90 backdrop-blur">
      <Container className="flex h-20 items-center justify-between py-3">
        <Logo variant="horizontal" priority className="h-10 w-auto sm:h-12" />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  active ? "font-semibold text-brand-secondary" : "text-text-secondary hover:text-brand-secondary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {!isLoading && user ? (
            <Button href={roleHomePath(user.role)} size="sm" variant="primary">
              Go to my account
            </Button>
          ) : (
            <>
              <Button href="/login" size="sm" variant="ghost">
                Sign in
              </Button>
              <Button href="/signup/student" size="sm" variant="primary">
                Find a tutor
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-primary lg:hidden"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </Container>

      {isOpen && (
        <div className="border-t border-border bg-surface lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "font-semibold text-brand-secondary"
                    : "text-text-secondary hover:text-brand-secondary",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              {!isLoading && user ? (
                <Button href={roleHomePath(user.role)} variant="primary">
                  Go to my account
                </Button>
              ) : (
                <>
                  <Button href="/login" variant="outline">
                    Sign in
                  </Button>
                  <Button href="/signup/student" variant="primary">
                    Find a tutor
                  </Button>
                </>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
