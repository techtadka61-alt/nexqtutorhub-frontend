export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
/** The separate admin panel app (NexTutorHub/adminPanel). */
export const ADMIN_PANEL_URL = process.env.NEXT_PUBLIC_ADMIN_PANEL_URL ?? "http://localhost:3002";
export const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL ?? "http://localhost:3000";

/** Prefixes a backend-relative upload path (e.g. "/api/uploads/profile-pictures/x.png") with the API origin. */
export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${ASSET_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
