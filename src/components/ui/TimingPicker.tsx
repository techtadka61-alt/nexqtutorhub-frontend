"use client";

import { cn } from "@/lib/cn";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { DAY_PRESETS, formatTime, TimeSelect, WEEK_DAYS } from "@/components/ui/AvailabilityPicker";
import type { WeekDay } from "@/types/api";

interface Timing {
  days: WeekDay[];
  from: string;
  to: string;
}

const DEFAULT_TIMING: Timing = { days: ["mon", "tue", "wed", "thu", "fri"], from: "17:00", to: "19:00" };
const SEPARATOR = " · ";

/** Days as text: runs of 3+ collapse to a range ("Mon–Fri"), all seven read "Every day". */
function describeDays(days: WeekDay[]): string {
  const indexes = WEEK_DAYS.map((d) => d.value)
    .map((day, index) => (days.includes(day) ? index : -1))
    .filter((index) => index >= 0);
  if (indexes.length === 7) return "Every day";
  const parts: string[] = [];
  for (let i = 0; i < indexes.length; ) {
    let j = i;
    while (j + 1 < indexes.length && indexes[j + 1] === indexes[j] + 1) j++;
    const run = indexes.slice(i, j + 1).map((index) => WEEK_DAYS[index].label);
    parts.push(run.length >= 3 ? `${run[0]}–${run[run.length - 1]}` : run.join(", "));
    i = j + 1;
  }
  return parts.join(", ");
}

/** The saved text, e.g. "Mon–Fri · 5:00 PM – 7:00 PM". */
export function describeTiming({ days, from, to }: Timing): string {
  return `${describeDays(days)}${SEPARATOR}${formatTime(from)} – ${formatTime(to)}`;
}

function to24h(label: string): string | undefined {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(label.trim());
  if (!match) return undefined;
  const hours = (Number(match[1]) % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return `${String(hours).padStart(2, "0")}:${match[2]}`;
}

/** Reads back text this picker wrote; undefined for anything else (e.g. older free-text timings). */
export function parseTiming(text: string): Timing | undefined {
  const [dayText, timeText] = text.split(SEPARATOR);
  if (!dayText || !timeText) return undefined;
  const [fromLabel, toLabel] = timeText.split(" – ");
  const from = fromLabel && to24h(fromLabel);
  const to = toLabel && to24h(toLabel);
  if (!from || !to) return undefined;
  const labels = WEEK_DAYS.map((d) => d.label);
  const days = new Set<WeekDay>();
  if (dayText === "Every day") WEEK_DAYS.forEach((d) => days.add(d.value));
  else
    for (const part of dayText.split(", ")) {
      const [start, end] = part.split("–");
      const a = labels.indexOf(start);
      const b = end ? labels.indexOf(end) : a;
      if (a < 0 || b < a) return undefined;
      for (let i = a; i <= b; i++) days.add(WEEK_DAYS[i].value);
    }
  return days.size ? { days: WEEK_DAYS.map((d) => d.value).filter((d) => days.has(d)), from, to } : undefined;
}

/**
 * Preferred tuition timing as days + a from/to time (12-hour, AM/PM). The value is plain text such as
 * "Mon–Fri · 5:00 PM – 7:00 PM", which is what the API stores; "" means not set. An older free-text value that
 * isn't in this format is kept as-is until the student picks a new timing.
 */
export function TimingPicker({
  label = "Preferred timing",
  required,
  optional,
  value,
  onChange,
  error,
}: {
  label?: string;
  required?: boolean;
  optional?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const timing = value ? parseTiming(value) : undefined;

  function set(next: Timing) {
    onChange(describeTiming(next));
  }

  function toggleDay(day: WeekDay) {
    if (!timing) return;
    const days = timing.days.includes(day) ? timing.days.filter((d) => d !== day) : [...timing.days, day];
    // Keep at least one day: an empty selection can't be described.
    if (days.length) set({ ...timing, days });
  }

  const invalidTime = !!timing && timing.from >= timing.to;

  return (
    <fieldset className="flex flex-col gap-3">
      <FieldLabel as="legend" required={required} optional={optional}>
        {label}
      </FieldLabel>

      {!timing ? (
        <div className="flex flex-col gap-2">
          {value && (
            <p className="text-xs text-text-secondary">
              Currently saved: <span className="font-medium text-text-primary">{value}</span>
            </p>
          )}
          <button
            type="button"
            onClick={() => set(DEFAULT_TIMING)}
            className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface text-sm font-semibold text-text-primary transition-colors hover:border-brand-secondary hover:text-brand-secondary"
          >
            <ClockIcon />
            {value ? "Choose days & time" : "Add preferred days & time"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-bg p-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Days">
              {WEEK_DAYS.map((day) => {
                const selected = timing.days.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      "h-9 min-w-11 cursor-pointer rounded-full border px-3 text-sm font-medium transition-colors",
                      selected
                        ? "border-brand-secondary bg-brand-secondary-light text-brand-primary"
                        : "border-border bg-surface text-text-secondary hover:border-brand-secondary/60",
                    )}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              {DAY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => set({ ...timing, days: preset.days })}
                  className="cursor-pointer font-semibold text-brand-secondary hover:text-brand-primary"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TimeSelect label="From" value={timing.from} onChange={(from) => set({ ...timing, from })} />
            <TimeSelect label="To" value={timing.to} invalid={invalidTime} onChange={(to) => set({ ...timing, to })} />
          </div>
          {invalidTime && <p className="-mt-2 text-xs font-medium text-error">End time must be after the start time.</p>}

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-text-secondary">
              <span className="font-semibold text-text-primary">{describeTiming(timing)}</span>
            </p>
            <button
              type="button"
              onClick={() => onChange("")}
              className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold text-error transition-colors hover:bg-error/10"
            >
              Clear
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-xs font-medium text-error">{error}</p>}
    </fieldset>
  );
}

/** Message for a timing whose end is not after its start, else null (for blocking a save). */
export function timingError(value: string): string | null {
  const timing = value ? parseTiming(value) : undefined;
  return timing && timing.from >= timing.to ? "Preferred timing: the end time must be after the start time." : null;
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
