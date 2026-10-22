import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/constants";

const SOCIAL_HANDLE = "@nextutorhub";

const SOCIAL_LINKS: { label: string; href: string; icon: ReactNode }[] = [
  { label: "Instagram", href: "https://www.instagram.com/_nexqira_/", icon: <InstagramIcon /> },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61579777559641", icon: <FacebookIcon /> },
];

export function TopBar() {
  return (
    <div className="bg-brand-primary text-white">
      <Container className="flex h-10 items-center justify-between gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-5 sm:gap-8">
          <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-2 hover:text-brand-accent">
            <MailIcon />
            <span className="hidden sm:inline">{SUPPORT_EMAIL}</span>
          </a>
          <a href={`tel:${SUPPORT_PHONE_HREF}`} className="inline-flex items-center gap-2 hover:text-brand-accent">
            <PhoneIcon />
            {SUPPORT_PHONE}
          </a>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline">{SOCIAL_HANDLE}</span>
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 transition-colors hover:text-brand-accent"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </Container>
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1Zm9 7.2L4 7.3V17h16V7.3l-8 4.9Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.6a1 1 0 01-.25 1l-2.2 2.2Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46h1.55V4.47A20.6 20.6 0 0014.3 4.3c-2.24 0-3.8 1.37-3.8 3.9v2.3H8v3h2.5V21h3Z" />
    </svg>
  );
}
