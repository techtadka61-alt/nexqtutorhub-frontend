"use client";

import { cn } from "@/lib/cn";
import type { AvailabilitySlot, WeekDay } from "@/types/api";

export const WEEK_DAYS: { value: WeekDay; label: string }[] = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
];

const DAY_PRESETS: { label: string; days: WeekDay[] }[] = [
  { label: "Weekdays", days: ["mon", "tue", "wed", "thu", "fri"] },
  { label: "Weekends", days: ["sat", "sun"] },
  { label: "All days", days: WEEK_DAYS.map((d) => d.value) },
];

/** 30-minute steps from 6:00 AM to 11:00 PM, as 24-hour "HH:mm" values with 12-hour labels. */
const TIME_OPTIONS = Array.from({ length: (23 - 6) * 2 + 1 }, (_, i) => {
  const minutes = 6 * 60 + i * 30;
  const value = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  return { value, label: formatTime(value) };
});

export const NEW_SLOT: AvailabilitySlot = { days: ["mon", "tue", "wed", "thu", "fri"], from: "16:00", to: "20:00" };

/** First problem with the slots, if any — used to block saving with a readable message. */
export function availabilityError(slots: AvailabilitySlot[]): string | null {
  for (const [index, slot] of slots.entries()) {
    if (!slot.days.length) return `Time slot ${index + 1}: choose at least one day.`;
    if (slot.from >= slot.to) return `Time slot ${index + 1}: the start time must be before the end time.`;
  }
  return null;
}

/** Weekly availability as day chips plus a from/to time range per slot; tutors can add several slots. */
export function AvailabilityPicker({
  label = "Availability",
  hint,
  value,
  onChange,
}: {
  label?: string;
  hint?: string;
  value: AvailabilitySlot[];
  onChange: (slots: AvailabilitySlot[]) => void;
}) {
  function updateSlot(index: number, patch: Partial<AvailabilitySlot>) {
    onChange(value.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  }

  function toggleDay(index: number, day: WeekDay) {
    const days = value[index].days;
    updateSlot(index, { days: days.includes(day) ? days.filter((d) => d !== day) : [...days, day] });
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium text-text-primary">{label}</legend>
      {hint && <p className="-mt-1 text-xs text-text-secondary">{hint}</p>}

      {value.length === 0 && (
        <p className="rounded-xl border border-dashed border-border bg-bg px-4 py-3 text-sm text-text-secondary">
          No time slots yet. Add the days and hours you&apos;re free to teach.
        </p>
      )}

      {value.map((slot, index) => {
        const invalidTime = slot.from >= slot.to;
        return (
          <div key={index} className="flex flex-col gap-4 rounded-xl border border-border bg-bg p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Time slot {index + 1}
              </span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold text-error transition-colors hover:bg-error/10"
              >
                Remove
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2" role="group" aria-label={`Days for time slot ${index + 1}`}>
                {WEEK_DAYS.map((day) => {
                  const selected = slot.days.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleDay(index, day.value)}
                      className={cn(
                        "h-10 min-w-12 cursor-pointer rounded-full border px-3 text-sm font-medium transition-colors",
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
                    onClick={() => updateSlot(index, { days: preset.days })}
                    className="cursor-pointer font-semibold text-brand-secondary hover:text-brand-primary"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:max-w-md">
              <TimeSelect label="From" value={slot.from} onChange={(from) => updateSlot(index, { from })} />
              <TimeSelect
                label="To"
                value={slot.to}
                invalid={invalidTime}
                onChange={(to) => updateSlot(index, { to })}
              />
            </div>
            {invalidTime && <p className="-mt-2 text-xs font-medium text-error">End time must be after the start time.</p>}
            {!slot.days.length && <p className="-mt-2 text-xs font-medium text-error">Choose at least one day.</p>}
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...value, value.length ? { ...NEW_SLOT, days: [] } : NEW_SLOT])}
        className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:border-brand-secondary hover:text-brand-secondary"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        {value.length ? "Add another time slot" : "Add time slot"}
      </button>
    </fieldset>
  );
}

function TimeSelect({
  label,
  value,
  invalid,
  onChange,
}: {
  label: string;
  value: string;
  invalid?: boolean;
  onChange: (value: string) => void;
}) {
  // Keep a saved value selectable even if it falls outside the 30-minute grid.
  const options = TIME_OPTIONS.some((o) => o.value === value)
    ? TIME_OPTIONS
    : [{ value, label: formatTime(value) }, ...TIME_OPTIONS];
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        className={cn(
          "h-11 w-full cursor-pointer rounded-xl border bg-surface px-3 text-sm text-text-primary transition-colors focus-ring",
          invalid ? "border-error" : "border-border focus:border-brand-secondary",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
}
