"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MultiSelectChips } from "@/components/ui/MultiSelectChips";
import { TutorCard } from "@/components/students/TutorCard";
import { ApiError } from "@/lib/api-client";
import { studentProfileApi } from "@/lib/api/profile";
import { tutorsApi, type TutorSearchSort } from "@/lib/api/tutors";
import { useCatalog } from "@/hooks/useCatalog";
import { cn } from "@/lib/cn";
import { fromGeoPoint, NEARBY_RADIUS_KM } from "@/lib/geolocation";
import { missingRequirement, REQUIREMENT_SETUP_PATH } from "@/lib/student-requirement";
import { compatibility, type MatchCriteria } from "@/lib/tutor-match";
import type { StudentProfile, TutorSearchResult } from "@/types/api";

const PAGE_SIZE = 12;

type ModeFilter = "any" | "home" | "online";

interface Filters {
  mode: ModeFilter;
  city: string;
  area: string;
  subjects: string[];
  studentClass: string;
  board: string;
  minFee: string;
  maxFee: string;
  sort: TutorSearchSort;
}

const EMPTY_FILTERS: Filters = {
  mode: "any",
  city: "",
  area: "",
  subjects: [],
  studentClass: "",
  board: "",
  minFee: "",
  maxFee: "",
  sort: "rating",
};

const MODE_OPTIONS: { value: ModeFilter; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "home", label: "Home" },
  { value: "online", label: "Online" },
];

const SORT_OPTIONS: { value: TutorSearchSort; label: string }[] = [
  { value: "rating", label: "Top rated" },
  { value: "feesAsc", label: "Fee: low to high" },
  { value: "feesDesc", label: "Fee: high to low" },
  { value: "experience", label: "Most experienced" },
];

/**
 * What the listing opens with: only the tuition mode. Every tutor within range shows up straight away, nearest
 * first; the saved requirement ranks them (match %) instead of hiding them, so the student never has to search
 * or clear filters to see who is nearby.
 */
function initialFilters(profile: StudentProfile | null): Filters {
  return { ...EMPTY_FILTERS, mode: requirementFilters(profile).mode };
}

/** The student's saved requirement, as search filters ("Match my requirement"). */
function requirementFilters(profile: StudentProfile | null): Filters {
  if (!profile) return EMPTY_FILTERS;
  const mode =
    profile.preferredTuitionMode === "home" || profile.preferredTuitionMode === "online"
      ? profile.preferredTuitionMode
      : "any";
  return {
    ...EMPTY_FILTERS,
    mode,
    city: profile.city ?? "",
    area: profile.area ?? "",
    subjects: profile.subjects ?? [],
    studentClass: profile.studentClass ?? "",
    board: profile.board ?? "",
    maxFee: profile.budget ? String(profile.budget) : "",
  };
}

function toNumber(value: string) {
  const n = Number(value);
  return value.trim() !== "" && Number.isFinite(n) && n >= 0 ? n : undefined;
}

type Coords = { lat: number; lng: number };

/**
 * Tutor listing for a signed-in student. It opens on every tutor within NEARBY_RADIUS_KM of the student's saved
 * location, nearest first, with no searching needed; the saved requirement (subjects, class, board, budget)
 * scores each tutor's fit. Filters can narrow the list without changing the saved profile.
 */
export function FindTutors() {
  const catalog = useCatalog();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [coords, setCoords] = useState<Coords | null>(null);
  // Tutors within range ignoring the other filters, so an empty result can say "nearby but not matching".
  const [nearbyTotal, setNearbyTotal] = useState<number | undefined>();
  const [locationError, setLocationError] = useState<string | null>(null);
  const [tutors, setTutors] = useState<TutorSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isSearching, setIsSearching] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  // Only the newest search may write results, so a slow earlier response can't overwrite a newer one.
  const requestId = useRef(0);

  useEffect(() => {
    studentProfileApi
      .getMine()
      .then((res) => {
        setProfile(res.item);
        setFilters(initialFilters(res.item));
        // Distance search starts from the location the student confirmed on the map (profile), not a fresh
        // browser fix: laptop geolocation is often kilometres off.
        const saved = fromGeoPoint(res.item.location);
        if (saved) setCoords(saved);
        setProfileLoaded(true);
      })
      // Can't read the requirement: still show the full listing rather than a dead end.
      .catch(() => setProfileLoaded(true));
  }, []);

  const nearMe = !!coords && filters.mode !== "online";

  function buildParams(f: Filters, pageNumber: number) {
    // Location only matters for home tuition; online tutors can teach from anywhere. "Near me" replaces
    // the typed city/area with a distance search around the student's position.
    const useTypedLocation = f.mode !== "online" && !coords;
    return {
      page: pageNumber,
      limit: PAGE_SIZE,
      teachingMode: f.mode === "any" ? undefined : f.mode,
      city: useTypedLocation ? f.city.trim() || undefined : undefined,
      area: useTypedLocation ? f.area.trim() || undefined : undefined,
      lat: coords && f.mode !== "online" ? coords.lat : undefined,
      lng: coords && f.mode !== "online" ? coords.lng : undefined,
      subjects: f.subjects,
      class: f.studentClass || undefined,
      board: f.board || undefined,
      minFee: toNumber(f.minFee),
      maxFee: toNumber(f.maxFee),
      sort: f.sort,
    };
  }

  // Re-search (debounced, so typing a city doesn't fire a request per keystroke) whenever filters change.
  useEffect(() => {
    if (!profileLoaded) return;
    const id = ++requestId.current;
    const timer = setTimeout(() => {
      setIsSearching(true);
      setError(null);
      tutorsApi
        .search(buildParams(filters, 1))
        .then((res) => {
          if (id !== requestId.current) return;
          setTutors(res.items);
          setTotal(res.pagination.total);
          setNearbyTotal(res.nearbyTotal);
          setPage(1);
        })
        .catch((err) => {
          if (id !== requestId.current) return;
          setTutors([]);
          setTotal(0);
          setError(err instanceof ApiError ? err.message : "Couldn't load tutors. Please try again.");
        })
        .finally(() => {
          if (id === requestId.current) setIsSearching(false);
        });
    }, 350);
    return () => clearTimeout(timer);
    // buildParams only reads filters and coords.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, coords, profileLoaded]);

  async function loadMore() {
    const id = requestId.current;
    setIsLoadingMore(true);
    try {
      const res = await tutorsApi.search(buildParams(filters, page + 1));
      if (id !== requestId.current) return;
      setTutors((prev) => [...prev, ...res.items]);
      setPage(page + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load more tutors.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  function toggleNearMe() {
    setLocationError(null);
    if (coords) return setCoords(null);
    const saved = fromGeoPoint(profile?.location);
    if (!saved) return setLocationError("Set where you need home tuition in your profile to search near you.");
    setCoords(saved);
  }

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  // Match % uses what the student is filtering for, falling back to their saved requirement.
  const requirement = requirementFilters(profile);
  const criteria: MatchCriteria = {
    subjects: filters.subjects.length ? filters.subjects : requirement.subjects,
    studentClass: filters.studentClass || requirement.studentClass || undefined,
    board: filters.board || requirement.board || undefined,
    mode: filters.mode,
    city: filters.city || requirement.city || undefined,
    area: filters.area || requirement.area || undefined,
    maxFee: toNumber(filters.maxFee) ?? toNumber(requirement.maxFee),
  };
  const missing = profile ? missingRequirement(profile) : [];
  const needsLocation = !coords && filters.mode !== "online";
  const feeRangeInvalid =
    toNumber(filters.minFee) !== undefined &&
    toNumber(filters.maxFee) !== undefined &&
    (toNumber(filters.minFee) as number) > (toNumber(filters.maxFee) as number);

  if (!profileLoaded) {
    return <p className="py-20 text-center text-sm text-text-secondary">Loading your matches…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">Find a tutor</span>
          <h1 className="mt-2 font-display text-3xl font-bold text-brand-primary sm:text-4xl">
            {nearMe ? `Tutors within ${NEARBY_RADIUS_KM} km of you` : "Tutors matched for you"}
          </h1>
          <p className="mt-2 max-w-2xl text-text-secondary">
            {profile ? requirementSummary(profile) : "Showing tutors across NexTutorHub."}
          </p>
        </div>
        <Button href="/account/profile" variant="outline" className="w-fit">
          Edit my requirement
        </Button>
      </div>

      {needsLocation && (
        <div className="flex flex-col gap-3 rounded-2xl border border-warning/40 bg-warning/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-primary">
            <span className="font-semibold">Add where you need tuition</span> to see every tutor within {NEARBY_RADIUS_KM} km of
            you automatically. Until then, tutors from across NexTutorHub are shown.
          </p>
          <Button href="/account/profile" size="sm" className="w-fit shrink-0">
            Set my location
          </Button>
        </div>
      )}
      {!needsLocation && missing.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            Tell us your class and subjects to see how well each tutor matches you.
          </p>
          <Button href={REQUIREMENT_SETUP_PATH} variant="outline" size="sm" className="w-fit shrink-0">
            Add my requirement
          </Button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:items-start">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text-primary lg:hidden"
        >
          Filters
          <span className="text-brand-secondary">{showFilters ? "Hide" : "Show"}</span>
        </button>

        <aside
          className={cn(
            "flex-col gap-6 rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-28 lg:flex",
            showFilters ? "flex" : "hidden",
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">Filters</h2>
            <button
              type="button"
              onClick={() => {
                setFilters(initialFilters(profile));
                setCoords(fromGeoPoint(profile?.location) ?? null);
              }}
              className="cursor-pointer text-xs font-semibold text-brand-secondary hover:text-brand-primary"
            >
              Show all nearby
            </button>
          </div>
          {profile && missing.length === 0 && (
            <button
              type="button"
              onClick={() => setFilters(requirementFilters(profile))}
              className="-mt-3 w-fit cursor-pointer text-xs font-semibold text-brand-secondary hover:text-brand-primary"
            >
              Only tutors matching my requirement
            </button>
          )}

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-text-primary">Tuition mode</legend>
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-bg p-1">
              {MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={filters.mode === option.value}
                  onClick={() => update("mode", option.value)}
                  className={cn(
                    "cursor-pointer rounded-lg py-2 text-sm font-medium transition-colors",
                    filters.mode === option.value
                      ? "bg-surface text-brand-primary shadow-card"
                      : "text-text-secondary hover:text-brand-primary",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-text-primary">Location</span>
            <button
              type="button"
              onClick={toggleNearMe}
              disabled={filters.mode === "online"}
              aria-pressed={nearMe}
              className={cn(
                "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                nearMe
                  ? "border-brand-secondary bg-brand-secondary-light text-brand-primary"
                  : "border-border bg-surface text-text-primary hover:border-brand-secondary",
              )}
            >
              <LocateIcon />
              {nearMe ? `Near me · within ${NEARBY_RADIUS_KM} km` : "Search near my saved location"}
            </button>
            {nearMe && (
              <p className="text-xs text-text-secondary">
                From: {profile?.locationMeta?.address ?? "your saved tuition location"} ·{" "}
                <a href="/account/profile" className="font-semibold text-brand-secondary hover:text-brand-primary">
                  Change
                </a>
              </p>
            )}
            {locationError && <p className="text-xs font-medium text-error">{locationError}</p>}
            <Input
              label="City"
              placeholder="e.g. Lucknow"
              value={filters.city}
              disabled={filters.mode === "online" || nearMe}
              onChange={(e) => update("city", e.target.value)}
            />
            <Input
              label="Area / locality"
              placeholder="e.g. Gomti Nagar"
              value={filters.area}
              disabled={filters.mode === "online" || nearMe}
              onChange={(e) => update("area", e.target.value)}
            />
            {filters.mode === "online" ? (
              <p className="text-xs text-text-secondary">Online tutors can teach from anywhere, so location isn&apos;t used.</p>
            ) : nearMe ? (
              <p className="text-xs text-text-secondary">
                Showing tutors who shared their location, nearest first. Turn off to search by city.
              </p>
            ) : null}
          </div>

          <MultiSelectChips
            label="Subjects"
            hint="Tutors teaching any of these"
            options={catalog.subjects}
            value={filters.subjects}
            onChange={(v) => update("subjects", v)}
          />

          <FilterSelect
            label="Class"
            value={filters.studentClass}
            anyLabel="Any class"
            options={catalog.classes}
            onChange={(v) => update("studentClass", v)}
          />
          <FilterSelect
            label="Board"
            value={filters.board}
            anyLabel="Any board"
            options={catalog.boards}
            onChange={(v) => update("board", v)}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">Monthly fee (₹)</span>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min fee"
                labelAsPlaceholder
                type="number"
                min={0}
                inputMode="numeric"
                value={filters.minFee}
                onChange={(e) => update("minFee", e.target.value)}
              />
              <Input
                label="Max fee"
                labelAsPlaceholder
                type="number"
                min={0}
                inputMode="numeric"
                value={filters.maxFee}
                onChange={(e) => update("maxFee", e.target.value)}
              />
            </div>
            {feeRangeInvalid && <p className="text-xs font-medium text-error">Min fee is higher than max fee.</p>}
          </div>
        </aside>

        <section aria-live="polite" className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg text-text-secondary">
              {isSearching ? (
                "Finding tutors…"
              ) : (
                <>
                  <strong className="font-bold text-text-primary">
                    {total} tutor{total === 1 ? "" : "s"}
                  </strong>{" "}
                  {resultsContext(filters, nearMe)}
                </>
              )}
            </p>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              Sort by
              <select
                value={filters.sort}
                disabled={nearMe}
                title={nearMe ? "Near-me results are sorted by distance" : undefined}
                onChange={(e) => update("sort", e.target.value as TutorSearchSort)}
                className="h-10 cursor-pointer rounded-xl border border-border bg-surface px-3 text-sm text-text-primary focus-ring disabled:cursor-not-allowed disabled:opacity-60"
              >
                {nearMe && <option value={filters.sort}>Nearest first</option>}
                {!nearMe &&
                  SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          {error && (
            <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</div>
          )}

          {isSearching && !tutors.length ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-surface" />
              ))}
            </div>
          ) : !tutors.length ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
              <h3 className="font-display text-lg font-bold text-brand-primary">
                {nearMe && !nearbyTotal ? `No tutors within ${NEARBY_RADIUS_KM} km yet` : "No tutors match all your filters"}
              </h3>
              <p className="max-w-md text-sm text-text-secondary">
                {nearMe && nearbyTotal
                  ? `${nearbyTotal} tutor${nearbyTotal === 1 ? " is" : "s are"} within ${NEARBY_RADIUS_KM} km of you, but they don't match your subject, class, board or fee filters. Clear the filters to see them.`
                  : nearMe
                    ? "No tutors have set a teaching location near you yet. Try online tuition, or check back soon."
                    : "Try removing a subject, widening the fee range, or clearing the area to see more tutors."}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  // Distance stays on: clearing the subject/class/fee filters is what reveals nearby tutors.
                  setFilters({ ...EMPTY_FILTERS, mode: filters.mode === "online" ? EMPTY_FILTERS.mode : filters.mode });
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className={cn("flex flex-col gap-4", isSearching && "opacity-60")}>
                {tutors.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    compatibility={compatibility(tutor, criteria)}
                    wantedSubjects={filters.subjects}
                  />
                ))}
              </div>
              {tutors.length < total && (
                <Button variant="outline" className="self-center" isLoading={isLoadingMore} onClick={loadMore}>
                  Show more tutors
                </Button>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

/** Words after the bold count: "near you in Gomti Nagar, Lucknow", "within 20 km of you", … */
function resultsContext(filters: Filters, nearMe: boolean) {
  if (filters.mode === "online") return "teaching online";
  if (nearMe) return `near you · within ${NEARBY_RADIUS_KM} km`;
  const place = [filters.area.trim(), filters.city.trim()].filter(Boolean).join(", ");
  return place ? `near you in ${place}` : "found";
}

function requirementSummary(profile: StudentProfile) {
  const parts = [
    profile.studentClass,
    profile.board,
    profile.subjects?.length ? profile.subjects.join(", ") : undefined,
    profile.preferredTuitionMode === "online"
      ? "Online tuition"
      : profile.city
        ? `${profile.preferredTuitionMode === "home" ? "Home tuition in " : "In "}${[profile.area, profile.city].filter(Boolean).join(", ")}`
        : undefined,
    profile.budget ? `up to ₹${profile.budget.toLocaleString("en-IN")}/month` : undefined,
  ].filter(Boolean);
  return parts.length ? `Based on your requirement: ${parts.join(" · ")}` : "Showing tutors across NexTutorHub.";
}

function FilterSelect({
  label,
  value,
  anyLabel,
  options,
  onChange,
}: {
  label: string;
  value: string;
  anyLabel: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full cursor-pointer rounded-xl border border-border bg-surface px-3 text-sm text-text-primary focus-ring"
      >
        <option value="">{anyLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function LocateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
      <circle cx="12" cy="12" r="7.5" />
    </svg>
  );
}
