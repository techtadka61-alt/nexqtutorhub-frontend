import type { MetadataRoute } from "next";
import { SITE_URL, SONBHADRA_LOCALITIES, localityPath } from "@/lib/seo";

/**
 * When the public page content last changed in a way worth re-crawling. Google only trusts `lastmod` if it is accurate
 * (a build-time `new Date()` on every URL teaches it to ignore the field), so bump this by hand when page copy changes.
 * `priority` and `changefreq` are left out on purpose: Google ignores both.
 */
const CONTENT_LAST_MODIFIED = "2026-11-02";

/** sitemap.xml: every public, indexable page. Submit SITE_URL/sitemap.xml in Google Search Console. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/home-tuition",
    ...SONBHADRA_LOCALITIES.map((l) => localityPath(l.slug)),
    "/request-tutor",
    "/for-tutors",
    "/how-it-works",
    "/about",
    "/contact",
    "/signup/student",
    "/signup/tutor",
    "/privacy",
    "/terms",
  ];

  return paths.map((path) => ({ url: `${SITE_URL}${path}`, lastModified: CONTENT_LAST_MODIFIED }));
}
