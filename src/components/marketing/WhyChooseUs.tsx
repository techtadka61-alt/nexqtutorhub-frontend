import Image from "next/image";
import { Container } from "@/components/ui/Container";
import whyChooseUsImage from "@/assets/images/why-choose-us-cutout.png";

const REASONS = [
  {
    title: "Verified ट्यूटर",
    description:
      "हर ट्यूटर की ID और qualification की जांच के बाद ही उनकी प्रोफ़ाइल सर्च में दिखती है, ताकि आपको पता रहे कि आपके बच्चे को कौन पढ़ा रहा है।",
    icon: <ShieldIcon />,
    tint: "bg-brand-primary text-white",
  },
  {
    title: "आपकी ज़रूरत के हिसाब से",
    description:
      "क्लास, सब्जेक्ट, बोर्ड, बजट, टाइमिंग और पढ़ाई का तरीका — घर पर, ऑनलाइन या दोनों — चुनें और वही ट्यूटर पाएं जो सच में आपके लिए सही हों।",
    icon: <TargetIcon />,
    tint: "bg-brand-secondary text-white",
  },
  {
    title: "प्राइवेसी सबसे पहले",
    description:
      "ट्यूटर आपके एरिया और दूरी से मिलते हैं, आपके पूरे पते से नहीं। आपकी सही लोकेशन किसी को पब्लिक में नहीं दिखती।",
    icon: <LockIcon />,
    tint: "bg-brand-accent text-brand-primary",
  },
  {
    title: "लोकल और पास में",
    description:
      "शहर या अपनी जगह से दूरी के हिसाब से खोजें, ताकि ऐसे ट्यूटर मिलें जो सच में घर आकर पढ़ा सकें — या कहीं से भी ऑनलाइन पढ़ाएं।",
    icon: <PinIcon />,
    tint: "bg-info text-white",
  },
];

export function WhyChooseUs() {
  return (
    <section lang="hi" className="bg-surface py-20">
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Image
          src={whyChooseUsImage}
          alt="NexTutorHub की खूबियों वाला बोर्ड देखते दो स्टूडेंट्स"
          sizes="(min-width: 1024px) 40vw, 80vw"
          className="mx-auto h-auto w-full max-w-sm lg:max-w-md"
        />

        {/* Phones (one column): centred, like the image above it; two columns from sm keep the left-aligned grid. */}
        <div className="max-sm:text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">
            हमें क्यों चुनें
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-brand-primary sm:text-4xl">
            भरोसे पर बना, आपकी ज़रूरत से मैच
          </h2>
          <p className="mt-4 text-text-secondary">
            NexTutorHub पर verification, सही मैचिंग और प्राइवेसी कंट्रोल एक साथ मिलते हैं, ताकि पेरेंट्स और
            ट्यूटर भरोसे से जुड़ सकें।
          </p>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-5">
            {REASONS.map((reason) => (
              <div key={reason.title} className="flex flex-col items-center gap-3 sm:items-start">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${reason.tint}`}
                >
                  {reason.icon}
                </span>
                <h3 className="text-base font-semibold text-text-primary">{reason.title}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 118 0v4" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
