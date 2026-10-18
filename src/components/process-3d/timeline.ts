/** Seconds each step of the story is on screen. */
export const STEP_SECONDS = 6;

export const STEPS = [
  {
    key: "post",
    title: "Student posts a requirement",
    description: "Class, subjects, budget and timing — posted from the phone in a minute.",
  },
  {
    key: "notify",
    title: "Tutors within 10 km are notified",
    description: "Only verified tutors inside the radius get the alert. Tutors farther away don't.",
  },
  {
    key: "apply",
    title: "Interested tutors apply",
    description: "Each tutor sends an application with their profile, experience and fees.",
  },
  {
    key: "call",
    title: "A quick phone call",
    description: "The student accepts a tutor, numbers are shared, and they talk through the plan.",
  },
  {
    key: "demo",
    title: "One-day demo class",
    description: "The tutor visits for a demo class so the student can judge the teaching first-hand.",
  },
  {
    key: "decide",
    title: "The student decides",
    description: "Happy with the demo? Continue with this tutor. If not, the other applicants are still there.",
  },
  {
    key: "close",
    title: "Request closed with a reason",
    description: "Back on NexTutorHub, the student closes the requirement and tells us why.",
  },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];
export const TOTAL_SECONDS = STEPS.length * STEP_SECONDS;

/** Which step is playing at time `t` and how far through it (0–1). */
export function stepAt(t: number): { index: number; key: StepKey; p: number } {
  const looped = ((t % TOTAL_SECONDS) + TOTAL_SECONDS) % TOTAL_SECONDS;
  const index = Math.min(STEPS.length - 1, Math.floor(looped / STEP_SECONDS));
  return { index, key: STEPS[index].key, p: (looped - index * STEP_SECONDS) / STEP_SECONDS };
}

/** Shared, mutable playback clock: read every frame by the scene, written by the controls. */
export interface PlaybackClock {
  t: number;
  playing: boolean;
}

/** Moves the shared clock forward by one frame (capped so a background tab doesn't skip whole steps). */
export function advanceClock(clock: PlaybackClock, dt: number) {
  if (clock.playing) clock.t = (clock.t + Math.min(dt, 0.1)) % TOTAL_SECONDS;
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0→1 as `p` moves from `a` to `b`, eased. */
export function ramp(p: number, a: number, b: number) {
  const x = clamp01((p - a) / (b - a));
  return x * x * (3 - 2 * x);
}
