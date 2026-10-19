import type { MetadataRoute } from "next";
import { SITE_URL, SONBHADRA_LOCALITIES, localityPath } from "@/lib/seo";

/** sitemap.xml: every public, indexable page. Submit SITE_URL/sitemap.xml in Google Search Console. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });

  return [
    page("/", 1, "weekly"),
    page("/home-tuition", 0.95, "weekly"),
    ...SONBHADRA_LOCALITIES.map((l) => page(localityPath(l.slug), 0.9, "weekly")),
    page("/request-tutor", 0.85, "monthly"),
    page("/for-tutors", 0.8, "monthly"),
    page("/how-it-works", 0.7, "monthly"),
    page("/about", 0.6, "monthly"),
    page("/contact", 0.6, "monthly"),
    page("/signup/student", 0.5, "yearly"),
    page("/signup/tutor", 0.5, "yearly"),
    page("/privacy", 0.2, "yearly"),
    page("/terms", 0.2, "yearly"),
  ];
}
