import { Hero } from "@/components/marketing/Hero";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { TrustBanner } from "@/components/marketing/TrustBanner";
import { WhyChooseUs } from "@/components/marketing/WhyChooseUs";
import { CtaSection } from "@/components/marketing/CtaSection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { HighlightsSection } from "@/components/marketing/HighlightsSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorksSection />
      <TrustBanner />
      <WhyChooseUs />
      <HighlightsSection />
      <CtaSection />
      <FaqSection />
    </>
  );
}
