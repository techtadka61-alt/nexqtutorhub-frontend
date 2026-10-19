import type { Metadata } from "next";
import { HomeTuitionPage } from "@/components/marketing/HomeTuitionPage";
import { pageOpenGraph } from "@/lib/seo";

const title = "Home Tuition in Sonbhadra — Verified Home Tutors";
const description =
  "Find verified home tutors in Sonbhadra: Robertsganj, Obra, Chopan, Renukoot, Pipri, Anpara, Dudhi, Ghorawal and more. Nursery to Class 12, CBSE, ICSE & UP Board. Free to post your requirement.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/home-tuition" },
  openGraph: pageOpenGraph(title, description, "/home-tuition"),
};

export default function SonbhadraHomeTuitionPage() {
  return <HomeTuitionPage />;
}
