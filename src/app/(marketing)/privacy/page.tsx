import type { Metadata } from "next";
import Link from "next/link";
import { LegalList, LegalPage, type LegalSection } from "@/components/marketing/LegalPage";
import { SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What personal data NexTutorHub collects, why, who can see it, and your rights over it.",
};

const strong = (text: string) => <strong className="font-semibold text-text-primary">{text}</strong>;

const SECTIONS: LegalSection[] = [
  {
    id: "collect",
    title: "Information we collect",
    body: (
      <>
        <p>{strong("You give us:")}</p>
        <LegalList
          items={[
            "Account details: full name, email address, mobile number, password (stored only as a secure hash) and whether you are a student or a tutor.",
            "Location: the place you confirm on the map — by GPS, a searched place or a pin — and your full address.",
            "Student requirement: class, board, subjects, budget, preferred timing, tuition mode, and optional guardian details.",
            "Tutor profile: qualification, experience, subjects, classes, boards, fees, availability, teaching area, and the resume(s) you upload with tuition applications.",
            "Profile photo, if you upload one, and messages you send through the contact form.",
          ]}
        />
        <p>{strong("From Google, if you sign up with Google:")} your name, email address, profile photo and a Google account identifier. We do not get your Google password, contacts or any other Google data.</p>
        <p>{strong("Automatically:")} basic technical data such as IP address, browser type and request logs, used for security and rate limiting.</p>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it",
    body: (
      <LegalList
        items={[
          "To create and secure your account, and to verify your email address.",
          "To match students and tutors within 10 km of each other (or online), and to show the approximate distance between you.",
          "To send service emails and notifications: welcome and verification emails, new nearby tutors or student requests, application updates and password resets.",
          "To review and verify tutors (our team uses tutors' resumes and details for this).",
          "To answer your questions, prevent fraud and abuse, and improve the platform.",
        ]}
      />
    ),
  },
  {
    id: "shared",
    title: "What other users can see",
    body: (
      <>
        <LegalList
          items={[
            <>
              {strong("Students nearby see a tutor's:")} name, photo, subjects, classes, boards, qualification, experience,
              fee, timings, area/city and approximate distance — and, once the tutor is verified, their contact number.
            </>,
            <>
              {strong("Verified tutors nearby see a student's request:")} first name, class, subjects, board, budget, timing,
              area/city, approximate distance and contact number while the request is open. Full name, email and full
              address are shared only with the tutor the student accepts.
            </>,
            <>
              {strong("Only our team can see:")} exact GPS coordinates, full addresses, tutor resumes and account emails.
            </>,
          ]}
        />
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Service providers",
    body: (
      <>
        <p>We do not sell your personal data. We share it only with providers that help run NexTutorHub, under their own security terms:</p>
        <LegalList
          items={[
            "Google Firebase — Google sign-in and email-verification links.",
            "Geoapify (OpenStreetMap data) — place search, maps and address lookup when you choose your location.",
            "Our email provider — to deliver the emails described above.",
            "Our hosting and database providers — to store and serve the platform.",
          ]}
        />
        <p>We may also disclose data when required by law, or to protect the safety of our users.</p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <LegalList
        items={[
          "Account and profile data: while your account is active, and for a limited period after it is closed where needed for legal, safety or dispute reasons.",
          "In-app notifications: about 90 days. Sent-email records: about 14 days (failed ones about 30 days).",
          "Resumes attached to tuition applications: kept with the application so our team can review it, and removed when no longer needed.",
        ]}
      />
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        Passwords are stored as one-way hashes, access to your data is limited to what each user and our team needs, and the
        platform is protected with measures such as encrypted connections and rate limiting. No online service can be
        perfectly secure, so please use a strong, unique password and tell us at once about any suspected misuse.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your rights and choices",
    body: (
      <>
        <p>Under India&rsquo;s Digital Personal Data Protection Act, 2023 and other applicable law, you can:</p>
        <LegalList
          items={[
            "see and correct your details at any time from your profile;",
            "remove your location, timing or other optional details, or deactivate your account;",
            "ask us for a summary of your personal data, or ask us to delete it;",
            "withdraw consent — note that some features (such as finding tutors near you) cannot work without the related data;",
            "raise a grievance with us, and, if unresolved, with the Data Protection Board of India.",
          ]}
        />
        <p>To make a request, email {SUPPORT_EMAIL} from your registered email address.</p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        Students under 18 must be registered by, and use NexTutorHub under the supervision of, a parent or legal guardian, who
        gives consent for the child&rsquo;s data to be processed as described here. If we learn a child has registered without
        this, we will remove the account.
      </p>
    ),
  },
  {
    id: "grievance",
    title: "Grievance officer and contact",
    body: (
      <p>
        For any privacy question or complaint, contact our grievance officer at {SUPPORT_EMAIL} or {SUPPORT_PHONE} (Nexqira,
        Sonbhadra, Uttar Pradesh, India). We will acknowledge your request within 48 hours and aim to resolve it within 30
        days.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We will post any update here with a new effective date and tell you about important changes by email or in the app.
        Please also read our{" "}
        <Link href="/terms" className="font-semibold text-brand-secondary underline underline-offset-2">
          Terms of Service
        </Link>
        .
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      effectiveDate="18 October 2026"
      intro={
        <p>
          NexTutorHub, a product of Nexqira, respects your privacy. This policy explains what personal data we collect when you
          use NexTutorHub, why we collect it, who can see it, and the choices you have.
        </p>
      }
      sections={SECTIONS}
      related={{ href: "/terms", label: "Terms of Service" }}
    />
  );
}
