import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt: crawl every public page. Only the one-time-token links (verify-email, reset-password) are blocked, so a
 * crawler can never open one and use up a token. Signed-in pages (/account, /my-requests, /find-tutors) are
 * deliberately NOT blocked: they send `noindex`, and Google only honours `noindex` on a page it is allowed to fetch —
 * blocking it here would hide the tag and let a linked URL show up in results without a snippet.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/verify-email", "/reset-password"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
