import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeTuitionPage } from "@/components/marketing/HomeTuitionPage";
import { SONBHADRA_LOCALITIES, getLocality, localityPath, pageOpenGraph } from "@/lib/seo";

/** Only the towns in SONBHADRA_LOCALITIES exist; anything else is a 404 rather than a thin generated page. */
export const dynamicParams = false;

export function generateStaticParams() {
  return SONBHADRA_LOCALITIES.map((l) => ({ town: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/home-tuition/[town]">): Promise<Metadata> {
  const { town } = await params;
  const locality = getLocality(town);
  if (!locality) return {};
  const title = `Home Tuition in ${locality.name}, Sonbhadra — Home Tutors Near You`;
  const description = `Find verified home tutors in ${locality.name} (${locality.hindi}), Sonbhadra for Nursery to Class 12 — CBSE, ICSE & UP Board, all subjects. Tutors within 10 km. Free to post your requirement.`;
  const path = localityPath(locality.slug);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: pageOpenGraph(title, description, path),
  };
}

export default async function TownHomeTuitionPage({ params }: PageProps<"/home-tuition/[town]">) {
  const { town } = await params;
  const locality = getLocality(town);
  if (!locality) notFound();
  return <HomeTuitionPage locality={locality} />;
}
