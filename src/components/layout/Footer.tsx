import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/for-tutors", label: "For tutors" },
      { href: "/find-tutors", label: "Find a tutor" },
      { href: "/signup/tutor", label: "Become a tutor" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/signup/student", label: "Create account" },
      { href: "/forgot-password", label: "Reset password" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-brand-primary text-white">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo variant="horizontal-light" href={false} className="h-12 w-auto" />
          <p className="max-w-sm text-sm leading-6 text-white/70">
            NexTutorHub connects students and parents with verified local tutors for home and
            online tuition — matched by subject, class, budget, and area, without exposing your
            exact address.
          </p>
          <p className="text-xs text-white/50">Starting in Sonbhadra, Uttar Pradesh</p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white">{col.title}</h3>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-brand-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-3 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} NexTutorHub. All rights reserved.</p>
          <p>Built for a safer, local tuition marketplace.</p>
        </Container>
      </div>
    </footer>
  );
}
