import { Container } from "@/components/ui/Container";

export interface FaqItem {
  question: string;
  answer: string;
}

// Everyday Hindi, as parents and tutors here speak it: "tutor", "verified", "registration" stay as they are said,
// in Devanagari or English, rather than formal Hindi equivalents.

export const STUDENT_FAQS: FaqItem[] = [
  {
    question: "क्या NexTutorHub फ्री है?",
    answer:
      "हाँ। अभी NexTutorHub स्टूडेंट्स और पेरेंट्स के लिए पूरी तरह फ्री है — न sign-up फीस, न booking फीस और न कोई कमीशन। आप ट्यूटर को सिर्फ़ वही फीस देते हैं जो आप उनसे तय करते हैं।",
  },
  {
    question: "मुझे सही ट्यूटर कैसे मिलेगा?",
    answer:
      "फ्री स्टूडेंट अकाउंट बनाएं और अपनी ज़रूरत बताएं — क्लास, सब्जेक्ट, बोर्ड, बजट, टाइमिंग और घर पर या ऑनलाइन ट्यूशन। फिर हम आपके एरिया के पास के Verified ट्यूटर दिखाते हैं जो आपकी ज़रूरत से मैच करते हैं।",
  },
  {
    question: "क्या ट्यूटर verified और भरोसेमंद हैं?",
    answer:
      "हाँ। हर ट्यूटर की ID और qualification की जांच के बाद ही उनकी प्रोफ़ाइल सर्च में दिखती है, ताकि आपको पता रहे कि कौन पढ़ा रहा है।",
  },
  {
    question: "क्या पहले डेमो क्लास मिलेगी?",
    answer:
      "कई ट्यूटर डेमो क्लास देते हैं। ट्यूटर से बात करते समय आप डेमो क्लास के लिए पूछ सकते हैं, और उनका पढ़ाने का तरीका पसंद आने पर ही आगे बढ़ें।",
  },
  {
    question: "कौन-सी क्लास और सब्जेक्ट पढ़ाए जाते हैं?",
    answer:
      "NexTutorHub पर ट्यूटर Nursery से Class 12 तक CBSE, ICSE और State Board के बच्चों को पढ़ाते हैं, साथ ही कॉलेज के सब्जेक्ट और competitive exams की तैयारी भी करवाते हैं।",
  },
  {
    question: "अगर ट्यूटर पसंद न आए तो?",
    answer:
      "आप किसी एक ट्यूटर से बंधे नहीं हैं। कभी भी अपने मैच पर वापस जाकर किसी दूसरे ट्यूटर से जुड़ सकते हैं जो आपके लिए बेहतर हो।",
  },
  {
    question: "क्या मेरा पता सुरक्षित रहेगा?",
    answer:
      "हाँ। ट्यूटर आपके एरिया और दूरी से मिलते हैं, आपके पूरे पते से नहीं। पूरी जानकारी कब और किसे देनी है, यह आप तय करते हैं।",
  },
  {
    question: "फीस कितनी है?",
    answer:
      "हर ट्यूटर अपनी फीस खुद तय करता है। आप अपने बजट के हिसाब से ट्यूटर देख सकते हैं, और फाइनल फीस व पेमेंट की बात सीधे ट्यूटर से कर सकते हैं।",
  },
  {
    question: "क्या घर पर और ऑनलाइन, दोनों तरह की ट्यूशन मिलती है?",
    answer:
      "हाँ। ज़रूरत बताते समय घर पर ट्यूशन, ऑनलाइन ट्यूशन या दोनों चुनें — हम उसी तरह पढ़ाने वाले ट्यूटर दिखाएंगे।",
  },
];

export const TUTOR_FAQS: FaqItem[] = [
  {
    question: "क्या ट्यूटर बनने के लिए पैसे देने होंगे?",
    answer:
      "नहीं। अभी NexTutorHub ट्यूटर्स के लिए पूरी तरह फ्री है — न लिस्टिंग फीस, न स्टूडेंट्स से मिलने वाली फीस पर कोई कमीशन।",
  },
  {
    question: "NexTutorHub पर ट्यूटर कैसे बनें?",
    answer:
      "फ्री ट्यूटर अकाउंट बनाएं, फिर अपनी प्रोफ़ाइल पूरी करें — सब्जेक्ट, क्लास, बोर्ड, qualification, experience, पढ़ाने का एरिया और फीस। Verified होने के बाद आपकी प्रोफ़ाइल पास के स्टूडेंट्स की सर्च में दिखने लगती है।",
  },
  {
    question: "Verified होना क्यों ज़रूरी है?",
    answer:
      "स्टूडेंट्स और पेरेंट्स Verified ट्यूटर को ज़्यादा भरोसे से चुनते हैं। ID और qualification की जांच से आपकी प्रोफ़ाइल भरोसेमंद बनती है और आपको ज़्यादा जवाब मिलते हैं।",
  },
  {
    question: "कहाँ और कैसे पढ़ाना है, यह कौन तय करता है?",
    answer:
      "आप। घर पर ट्यूशन के लिए अपना शहर, एरिया और लोकेशन सेट करें (10 किमी के अंदर के स्टूडेंट्स से मैच होगा), ऑनलाइन पढ़ाने के लिए खुद को available मार्क करें, या दोनों। आप सिर्फ़ उन्हीं सर्च में दिखेंगे जो आपकी सेटिंग से मैच करती हैं।",
  },
  {
    question: "मेरी फीस कौन तय करता है?",
    answer: "आप खुद। अपनी प्रोफ़ाइल पर महीने की फीस और availability सेट करें, और जब चाहें बदलें।",
  },
  {
    question: "क्या स्टूडेंट्स को मेरा पूरा पता दिखेगा?",
    answer:
      "नहीं। स्टूडेंट्स को सिर्फ़ आपका एरिया और दूरी दिखती है, पूरा पता कभी नहीं। जुड़ने के बाद क्या शेयर करना है, यह आप तय करते हैं।",
  },
  {
    question: "एक से ज़्यादा सब्जेक्ट या क्लास पढ़ाना हो तो?",
    answer:
      "आप जितने भी सब्जेक्ट, क्लास और बोर्ड पढ़ा सकते हैं, सब जोड़ें — उन सभी के स्टूडेंट्स से आपका मैच होगा।",
  },
];

/** For pages read by students and tutors alike (Contact, Terms, Privacy). */
export const GENERAL_FAQS: FaqItem[] = [
  {
    question: "क्या NexTutorHub फ्री है?",
    answer:
      "हाँ। अभी NexTutorHub स्टूडेंट्स, पेरेंट्स और ट्यूटर्स, सभी के लिए पूरी तरह फ्री है — न sign-up फीस, न लिस्टिंग फीस और न कोई कमीशन। ट्यूशन फीस स्टूडेंट और ट्यूटर आपस में तय करते हैं।",
  },
  {
    question: "10 किमी वाली मैचिंग कैसे काम करती है?",
    answer:
      "स्टूडेंट और ट्यूटर दोनों मैप पर अपनी लोकेशन सेट करते हैं (GPS से, जगह सर्च करके या पिन लगाकर)। स्टूडेंट्स को अपने 10 किमी के अंदर के ट्यूटर दिखते हैं, और ट्यूटर्स को 10 किमी के अंदर की स्टूडेंट requests — साथ में लगभग दूरी भी दिखती है।",
  },
  {
    question: "मेरा फ़ोन नंबर और पता कौन देख सकता है?",
    answer:
      "आपका पूरा पता और सही लोकेशन किसी दूसरे यूज़र को कभी नहीं दिखती — सिर्फ़ दूरी दिखती है। Verified ट्यूटर का नंबर स्टूडेंट्स को दिखता है, और खुली request वाले स्टूडेंट का नंबर पास के Verified ट्यूटर्स को दिखता है, ताकि आप सीधे बात कर सकें।",
  },
  {
    question: "ट्यूटर verify कैसे होते हैं?",
    answer:
      "ट्यूटर अपनी जानकारी और resume के साथ apply करते हैं। हमारी टीम उनकी ID और qualification चेक करती है, उसके बाद ही उन्हें Verified badge मिलता है और स्टूडेंट्स उनसे संपर्क कर पाते हैं।",
  },
  {
    question: "क्या Google से sign up कर सकते हैं?",
    answer:
      "हाँ। “Sign up with Google” चुनें, फिर अपना मोबाइल नंबर, पता और लोकेशन जोड़ें। आपका ईमेल अपने-आप verify हो जाता है।",
  },
  {
    question: "NexTutorHub टीम से कैसे संपर्क करें?",
    answer:
      "Contact फ़ॉर्म भरें, nexqira.online@gmail.com पर ईमेल करें या +91 93697 76898 पर कॉल करें। हम आमतौर पर 1–2 वर्किंग डे में जवाब देते हैं।",
  },
];

interface FaqSectionProps {
  items?: FaqItem[];
  subtitle?: string;
}

/** Shared FAQ accordion. Defaults to student questions; pass `TUTOR_FAQS` on tutor-facing pages. */
export function FaqSection({
  items = STUDENT_FAQS,
  subtitle = "ट्यूटर खोजने से पहले जानने वाली सारी बातें।",
}: FaqSectionProps) {
  return (
    <section lang="hi" className="bg-surface py-20">
      <Container className="max-w-4xl">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">FAQ</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-brand-primary sm:text-4xl">
            अक्सर पूछे जाने वाले सवाल
          </h2>
          <p className="mt-4 text-text-secondary">{subtitle}</p>
        </div>

        <div className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {items.map((faq) => (
            // A shared `name` makes the group an exclusive accordion: opening one closes the others.
            <details key={faq.question} name="faq" className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-base font-medium text-text-primary transition-colors hover:text-brand-secondary focus-ring [&::-webkit-details-marker]:hidden">
                {faq.question}
                <PlusIcon />
              </summary>
              <p className="px-6 pb-5 text-sm leading-relaxed text-text-secondary">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

function PlusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className="shrink-0 transition-transform duration-200 group-open:rotate-45"
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
