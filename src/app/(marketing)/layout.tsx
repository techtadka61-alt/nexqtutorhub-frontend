import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { ComingSoonCities } from "@/components/marketing/ComingSoonCities";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      {/* Last section of every site page, just above the footer. */}
      <ComingSoonCities />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
