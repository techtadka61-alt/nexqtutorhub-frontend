import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, pageOpenGraph } from "@/lib/seo";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { TrustBanner } from "@/components/marketing/TrustBanner";
import { WhyChooseUs } from "@/components/marketing/WhyChooseUs";
import { CtaSection } from "@/components/marketing/CtaSection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { HighlightsSection } from "@/components/marketing/HighlightsSection";

// Title and description come from the root layout (the site-wide defaults target "home tuition in Sonbhadra").
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: pageOpenGraph(DEFAULT_TITLE, DEFAULT_DESCRIPTION, "/"),
};

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
