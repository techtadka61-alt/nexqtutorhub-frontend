import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/seo";
import Link from "next/link";
import { LegalList, LegalPage, type LegalSection } from "@/components/marketing/LegalPage";
import { SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use NexTutorHub, a product by Nexqira, as a student, parent or tutor.",
  alternates: { canonical: "/terms" },
  openGraph: pageOpenGraph("Terms of Service", "The terms that apply when you use NexTutorHub, a product by Nexqira, as a student, parent or tutor.", "/terms"),
};

const strong = (text: string) => <strong className="font-semibold text-text-primary">{text}</strong>;

const SECTIONS: LegalSection[] = [
  {
    id: "about",
    title: "About NexTutorHub",
    body: (
      <>
        <p>
          NexTutorHub (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;the platform&rdquo;) is a product of {strong("Nexqira")}. It helps
          students and parents find home and online tutors near them, and helps tutors find students. We are a meeting
          place only: {strong("tuition itself is an arrangement directly between the student (or parent) and the tutor")}.
          We are not an employer, agent or school, and we do not teach, supervise classes or handle fees.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Who can use NexTutorHub",
    body: (
      <LegalList
        items={[
          "You must be at least 18 years old to create an account. Students under 18 must be registered and supervised by a parent or legal guardian, who accepts these terms on their behalf.",
          "Tutors must be at least 18 years old and legally able to offer tuition services in India.",
          "You may hold only one account, and the details you give (name, email, mobile number, address, location) must be true and your own.",
        ]}
      />
    ),
  },
  {
    id: "accounts",
    title: "Your account",
    body: (
      <LegalList
        items={[
          "You can sign up with email and password or with Google. With Google, we receive your name, email address and profile photo from your Google account; you add your mobile number, address and location yourself.",
          "Keep your password private. You are responsible for activity on your account; tell us at once if you think someone else has used it.",
          "We may ask you to verify your email address or mobile number before you can use some features.",
          "You can deactivate your account at any time from your profile, or by contacting us.",
        ]}
      />
    ),
  },
  {
    id: "free",
    title: "Fees — free in version 1",
    body: (
      <>
        <p>
          In this first version, NexTutorHub is {strong("completely free for students, parents and tutors")}. We charge no
          sign-up fee, no listing fee and no commission.
        </p>
        <p>
          The tuition fee is agreed and paid directly between the student/parent and the tutor; NexTutorHub is not a party
          to that payment and is not responsible for refunds or disputes about it. If we introduce paid plans in future,
          we will tell you in advance and they will never apply to you without your agreement.
        </p>
      </>
    ),
  },
  {
    id: "tutors",
    title: "Tutor verification and responsibilities",
    body: (
      <>
        <LegalList
          items={[
            "Tutors apply with their details and resume. Our team reviews applications and may approve or reject them, or later remove a verified badge, at our discretion.",
            "Verification means we checked the documents and information provided at that time. It is not a guarantee of a tutor's conduct, skills or results.",
            "Tutors must give accurate information about their qualifications, experience, subjects, fees and availability, and keep it up to date.",
            "Tutors must behave professionally and safely, especially with minors, and must follow all applicable laws.",
          ]}
        />
      </>
    ),
  },
  {
    id: "students",
    title: "Students and parents",
    body: (
      <LegalList
        items={[
          "Before engaging a tutor, please meet them, check their identity and qualifications for yourself, and consider a demo class.",
          "A parent or guardian should be present or nearby when a minor has home tuition, especially in the first sessions.",
          "Post only genuine tuition requirements. Requests may be shown to verified tutors within 10 km of your location (or to online tutors), together with your contact number so they can reach you.",
        ]}
      />
    ),
  },
  {
    id: "sharing",
    title: "How contact details are shared",
    body: (
      <>
        <p>To make it easy to connect, some of your details are shown to other users:</p>
        <LegalList
          items={[
            <>
              {strong("Tutors' details shown to students nearby:")} name, photo, subjects, classes, qualification,
              experience, fee, timings, the approximate distance from the student, and — once the tutor is verified — the
              tutor&rsquo;s contact number.
            </>,
            <>
              {strong("Students' details shown to verified tutors nearby:")} first name, class, subjects, board, budget,
              preferred timing, area/city, approximate distance and contact number for open requests.
            </>,
            <>
              {strong("Never shown to other users:")} exact GPS coordinates, full home addresses, tutor resumes and email
              addresses (until a student accepts a tutor&rsquo;s application).
            </>,
          ]}
        />
        <p>
          You agree to use other users&rsquo; contact details only to arrange tuition through NexTutorHub, never for spam,
          marketing, harassment or any other purpose.
        </p>
      </>
    ),
  },
  {
    id: "conduct",
    title: "Acceptable use",
    body: (
      <>
        <p>You must not:</p>
        <LegalList
          items={[
            "give false information, impersonate anyone, or create fake accounts or requests;",
            "harass, threaten, discriminate against or harm any user, or behave inappropriately with a minor;",
            "collect or scrape other users' data, or send them unsolicited messages;",
            "upload anything unlawful, offensive or that infringes someone else's rights;",
            "try to break, overload or get unauthorised access to the platform, or get around its rate limits or security.",
          ]}
        />
        <p>
          We may remove content, limit features, or suspend or close accounts that break these terms. Serious matters may be
          reported to the police.
        </p>
      </>
    ),
  },
  {
    id: "communications",
    title: "Emails and notifications",
    body: (
      <p>
        By using NexTutorHub you agree to receive service emails and in-app notifications — for example account
        verification, a welcome email, password resets, new tutors or student requests within 10 km of you, and updates on
        your requests and applications. These are part of how the service works.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Disclaimers and limitation of liability",
    body: (
      <>
        <p>
          NexTutorHub is provided &ldquo;as is&rdquo;. We work to keep it accurate and available, but we do not promise it
          will always be error-free or uninterrupted, and we do not guarantee that you will find a tutor or a student.
        </p>
        <p>
          Because tuition is arranged directly between users, {strong("we are not responsible for the conduct of any user")},
          the quality of tuition, or any loss, injury or dispute arising from it. To the extent the law allows, our total
          liability to you for any claim about the platform is limited to ₹1,000.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    title: "Privacy",
    body: (
      <p>
        How we collect, use and protect your personal data is explained in our{" "}
        <Link href="/privacy" className="font-semibold text-brand-secondary underline underline-offset-2">
          Privacy Policy
        </Link>
        , which forms part of these terms.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these terms as the platform grows. We will post the new version here with a new effective date, and
        tell you by email or in the app about important changes. Continuing to use NexTutorHub after that means you accept the
        updated terms.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law and disputes",
    body: (
      <p>
        These terms are governed by the laws of India. Please contact us first at {SUPPORT_EMAIL} so we can try to resolve any
        concern. Any dispute that cannot be resolved will be subject to the courts of Sonbhadra, Uttar Pradesh.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      effectiveDate="18 October 2026"
      intro={
        <p>
          Please read these terms carefully. By creating an account or using NexTutorHub, you agree to them. If you do not
          agree, please do not use the platform.
        </p>
      }
      sections={SECTIONS}
      related={{ href: "/privacy", label: "Privacy Policy" }}
    />
  );
}
