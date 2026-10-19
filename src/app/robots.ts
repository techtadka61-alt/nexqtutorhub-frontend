import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt: crawl every public page; keep crawlers out of signed-in areas and one-time links (verify-email,
 * reset-password tokens), which have nothing to index and would only waste crawl budget. Those pages also send
 * `noindex` themselves, which is what actually keeps a URL out of results if someone links to it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account/", "/my-requests", "/verify-email", "/reset-password", "/find-tutors/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
