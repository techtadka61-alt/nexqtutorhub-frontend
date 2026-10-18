import { UserRole, type TuitionMode, type TuitionRequestApplicationStatus, type TuitionRequestStatus } from "@/types/api";

/** Where each role manages tuition requests: students on the public site, tutors in their account. */
export function requestsPathFor(role: UserRole): string | null {
  if (role === UserRole.STUDENT) return "/my-requests";
  if (role === UserRole.TUTOR) return "/account/tutor/requests";
  return null;
}

type BadgeVariant = "mint" | "success" | "warning" | "error" | "info" | "neutral";

export const REQUEST_MODE_LABEL: Record<TuitionMode, string> = {
  home: "Home tuition",
  online: "Online tuition",
  both: "Home or online",
};

export const REQUEST_STATUS: Record<TuitionRequestStatus, { label: string; variant: BadgeVariant }> = {
  open: { label: "Open", variant: "success" },
  matched: { label: "Tutor found", variant: "info" },
  closed: { label: "Closed", variant: "neutral" },
};

export const APPLICATION_STATUS: Record<TuitionRequestApplicationStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: "Awaiting reply", variant: "warning" },
  accepted: { label: "Accepted", variant: "success" },
  declined: { label: "Not selected", variant: "neutral" },
  withdrawn: { label: "Withdrawn", variant: "neutral" },
};

/** "Class 10 · CBSE · Mathematics, Science" */
export function requestSummary(request: { studentClass: string; board?: string; subjects: string[] }) {
  return [request.studentClass, request.board, request.subjects.join(", ")].filter(Boolean).join(" · ");
}

export function requestLocation(request: { tuitionMode: TuitionMode; city?: string; area?: string }) {
  const place = [request.area, request.city].filter(Boolean).join(", ");
  return place || (request.tuitionMode === "online" ? "Online" : "—");
}

export function formatRequestDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
}
