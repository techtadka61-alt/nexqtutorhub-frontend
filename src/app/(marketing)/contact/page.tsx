import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card, CardBody } from "@/components/ui/Card";
import { ContactForm } from "@/components/marketing/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the NexTutorHub team.",
};

const CHANNELS = [
  {
    title: "Email",
    value: "support@nextutorhub.com",
    icon: <MailIcon />,
  },
  {
    title: "Phone",
    value: "+91 98765 43210",
    icon: <PhoneIcon />,
  },
  {
    title: "Location",
    value: "Sonbhadra, Uttar Pradesh, India",
    icon: <PinIcon />,
  },
];

export default function ContactPage() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="grid gap-12 lg:grid-cols-2">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">
            Contact us
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold text-brand-primary sm:text-4xl">
            We&rsquo;d love to hear from you
          </h1>
          <p className="mt-4 max-w-md text-text-secondary">
            Questions about finding a tutor, becoming a tutor, or anything else — send us a message
            and we&rsquo;ll get back to you.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            {CHANNELS.map((channel) => (
              <div key={channel.title} className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-secondary-light text-brand-primary">
                  {channel.icon}
                </span>
                <div>
                  <p className="text-xs text-text-secondary">{channel.title}</p>
                  <p className="text-sm font-medium text-text-primary">{channel.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardBody>
            <ContactForm />
          </CardBody>
        </Card>
      </Container>
    </section>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.9.34 1.78.66 2.61a2 2 0 01-.45 2.11L8.09 9.67a16 16 0 006.24 6.24l1.23-1.23a2 2 0 012.11-.45c.83.32 1.71.54 2.61.66A2 2 0 0122 16.92Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
