import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/seo";
import { FaqSection } from "@/components/marketing/FaqSection";
import { Container } from "@/components/ui/Container";
import { RequestTutorForm } from "@/components/students/RequestTutorForm";
import { ProtectedRoute } from "@/components/account/ProtectedRoute";
import { UserRole } from "@/types/api";

export const metadata: Metadata = {
  title: "Post a Tuition Requirement — Get a Home Tutor in Sonbhadra",
  description:
    "Tell us your class, board, subjects, location and budget. Verified home tutors within 10 km in Sonbhadra apply to you, and you choose. Free, takes a minute.",
  alternates: { canonical: "/request-tutor" },
  openGraph: pageOpenGraph("Post a Tuition Requirement — Get a Home Tutor in Sonbhadra", "Tell us your class, board, subjects, location and budget. Verified home tutors within 10 km in Sonbhadra apply to you, and you choose. Free, takes a minute.", "/request-tutor"),
};

const HOW_IT_WORKS = [
  "बताएं क्या चाहिए — क्लास, सब्जेक्ट, घर पर या ऑनलाइन",
  "आपके पास के Verified ट्यूटर एक छोटे मैसेज के साथ apply करते हैं",
  "उनकी प्रोफ़ाइल देखें और जो पसंद आए उसे चुनें",
  "आपका फ़ोन नंबर सिर्फ़ उसी ट्यूटर को दिखेगा",
];

/** Open to guests (they sign up on submit) and students; tutors and admins are told it isn't for them. */
export default function RequestTutorPage() {
  return (
    <ProtectedRoute allow={[UserRole.STUDENT]} allowGuests>
      <section lang="hi" className="bg-surface py-10 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div>
            <span className="inline-block rounded-full bg-brand-secondary-light px-4 py-1.5 text-xs font-semibold text-brand-primary">
              स्टूडेंट्स और पेरेंट्स के लिए
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-brand-primary sm:text-4xl lg:text-5xl">
              अपने लिए सही <span className="text-brand-secondary">ट्यूटर</span> खोजें
            </h1>
            <p className="mt-4 max-w-lg leading-relaxed text-text-secondary">
              एक बार अपनी ज़रूरत बताएं और Verified ट्यूटर खुद आप तक आएंगे — न लंबी लिस्ट देखनी, न अनजान
              कॉल।
            </p>
            <ol className="mt-8 hidden gap-3 sm:grid">
              {HOW_IT_WORKS.map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-3 text-sm text-text-primary"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-secondary-light text-xs font-bold text-brand-primary">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-border bg-bg p-5 shadow-soft sm:p-8">
            <RequestTutorForm />
          </div>
        </Container>
      </section>
      <FaqSection />
    </ProtectedRoute>
  );
}
