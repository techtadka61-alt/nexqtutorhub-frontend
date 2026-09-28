import { CLASS_OPTIONS } from "@/lib/constants";
import type { TutorSearchResult } from "@/types/api";

/** What the student is looking for — their saved requirement, possibly adjusted by listing filters. */
export interface MatchCriteria {
  subjects: string[];
  studentClass?: string;
  board?: string;
  mode: "any" | "home" | "online";
  city?: string;
  area?: string;
  maxFee?: number;
}

const WEIGHTS = { subjects: 35, class: 20, location: 15, board: 10, mode: 10, fee: 10 };

const same = (a?: string, b?: string) =>
  !!a && !!b && (a.trim().toLowerCase().includes(b.trim().toLowerCase()) || b.trim().toLowerCase().includes(a.trim().toLowerCase()));

/**
 * 0–100 fit between a tutor and what the student asked for. Only criteria the student actually specified
 * count, each weighted (subjects matter most), so a sparse requirement isn't penalised. Null when there's
 * nothing to compare against.
 */
export function compatibility(tutor: TutorSearchResult, want: MatchCriteria): number | null {
  let earned = 0;
  let possible = 0;
  const score = (weight: number, fraction: number) => {
    possible += weight;
    earned += weight * Math.max(0, Math.min(1, fraction));
  };

  if (want.subjects.length) {
    const taught = new Set((tutor.subjects ?? []).map((s) => s.toLowerCase()));
    score(WEIGHTS.subjects, want.subjects.filter((s) => taught.has(s.toLowerCase())).length / want.subjects.length);
  }
  if (want.studentClass) score(WEIGHTS.class, (tutor.classes ?? []).some((c) => same(c, want.studentClass)) ? 1 : 0);
  if (want.board) score(WEIGHTS.board, (tutor.boards ?? []).some((b) => same(b, want.board)) ? 1 : 0);
  if (want.mode !== "any")
    score(WEIGHTS.mode, tutor.teachingMode === want.mode || tutor.teachingMode === "both" ? 1 : 0);
  if (want.mode !== "online" && (want.city || tutor.distanceKm !== undefined)) {
    let fraction = 0;
    if (tutor.distanceKm !== undefined)
      fraction = tutor.distanceKm <= 3 ? 1 : tutor.distanceKm <= 8 ? 0.8 : tutor.distanceKm <= 15 ? 0.6 : 0.4;
    else if (want.area && same(tutor.area, want.area)) fraction = 1;
    else if (same(tutor.city, want.city)) fraction = 0.7;
    score(WEIGHTS.location, fraction);
  }
  if (want.maxFee) {
    const fee = tutor.feeRange;
    score(WEIGHTS.fee, fee === undefined ? 0.5 : fee <= want.maxFee ? 1 : 1 - (fee - want.maxFee) / want.maxFee);
  }
  return possible ? Math.round((earned / possible) * 100) : null;
}

/** One-line headline built from what the tutor teaches, e.g. "Mathematics & Physics tutor · Class 9 – Class 10". */
export function tutorTagline(tutor: TutorSearchResult, preferSubjects: string[] = []): string {
  const wanted = new Set(preferSubjects.map((s) => s.toLowerCase()));
  const subjects = [...(tutor.subjects ?? [])].sort(
    (a, b) => Number(wanted.has(b.toLowerCase())) - Number(wanted.has(a.toLowerCase())),
  );
  const classes = [...(tutor.classes ?? [])].sort((a, b) => CLASS_OPTIONS.indexOf(a) - CLASS_OPTIONS.indexOf(b));
  const what = subjects.length ? `${subjects.slice(0, 2).join(" & ")} tutor` : "Tutor";
  const forWhom = classes.length > 1 ? `${classes[0]} – ${classes[classes.length - 1]}` : classes[0];
  return forWhom ? `${what} · ${forWhom}` : what;
}

export function initials(name?: string): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "T") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
