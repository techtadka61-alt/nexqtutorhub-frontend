"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { STEP_SECONDS, STEPS, type PlaybackClock } from "./timeline";

// three.js is heavy and browser-only: load it only on the client, and only once the section is near the screen.
const ProcessCanvas = dynamic(() => import("./ProcessCanvas").then((m) => m.ProcessCanvas), {
  ssr: false,
  loading: () => <Loading />,
});

/**
 * Self-contained 3D walkthrough of the whole journey: student posts → tutors within 10 km notified → tutors
 * apply → phone call → 1-day demo → student decides → request closed with a reason. Drop it on any page.
 */
export function ProcessAnimation({ className }: { className?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const clock = useRef<PlaybackClock>({ t: 0, playing: true });
  const [mounted, setMounted] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting);
        if (!entry.isIntersecting) return;
        setMounted((wasMounted) => {
          // First time it comes into view: respect reduced-motion by starting paused (steps still clickable).
          if (!wasMounted && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            clock.current.playing = false;
            setPlaying(false);
          }
          return true;
        });
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function togglePlay() {
    clock.current.playing = !clock.current.playing;
    setPlaying(clock.current.playing);
  }

  function goTo(index: number) {
    // A hair past the boundary so the step's own opening frames play.
    clock.current.t = index * STEP_SECONDS + 0.01;
    setStep(index);
  }

  const current = STEPS[step];

  return (
    <div className={cn("overflow-hidden rounded-3xl border border-border bg-surface shadow-lifted", className)}>
      <div ref={container} className="relative h-[420px] w-full sm:h-[520px] lg:h-[580px]">
        {mounted && <ProcessCanvas clock={clock} active={onScreen} onStep={setStep} />}

        {/* caption */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-white/95 via-white/70 to-transparent px-5 pb-10 pt-4 sm:px-8 sm:pt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
            Step {step + 1} of {STEPS.length}
          </p>
          <h3 key={current.key} className="mt-1 font-display text-xl font-bold text-brand-primary sm:text-2xl">
            {current.title}
          </h3>
          <p className="mt-1 max-w-xl text-sm text-text-secondary">{current.description}</p>
        </div>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause animation" : "Play animation"}
          className="absolute bottom-4 right-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-brand-primary text-white shadow-lifted transition-colors hover:bg-brand-primary-hover focus-ring"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>

      {/* step track */}
      <ol className="grid grid-cols-7 border-t border-border">
        {STEPS.map((s, i) => (
          <li key={s.key}>
            <button
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === step ? "step" : undefined}
              title={s.title}
              className={cn(
                "relative flex h-full w-full cursor-pointer flex-col items-center gap-1 px-1 py-3 text-center transition-colors hover:bg-bg sm:px-2",
                i === step ? "text-brand-primary" : "text-text-secondary",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  i < step && "bg-brand-secondary-light text-brand-primary",
                  i === step && "bg-brand-primary text-white",
                  i > step && "bg-border/70 text-text-secondary",
                )}
              >
                {i + 1}
              </span>
              <span className="hidden text-[11px] font-semibold leading-tight md:block">{s.title}</span>
              {i === step && playing && (
                <span
                  key={`${s.key}-progress`}
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-secondary"
                  style={{ animation: `step-progress ${STEP_SECONDS}s linear forwards` }}
                />
              )}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#e7f3ef]">
      <span className="h-9 w-9 animate-spin rounded-full border-2 border-brand-secondary border-t-transparent" />
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6.5" y="5" width="4" height="14" rx="1" />
      <rect x="13.5" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}
