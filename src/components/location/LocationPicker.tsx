"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { OptionalTag, RequiredMark } from "@/components/ui/FieldLabel";
import { GEOAPIFY_API_KEY, reverseGeocode, searchPlaces, type PlaceSuggestion } from "@/lib/geoapify";
import {
  accuracyLevel,
  formatDistance,
  getCurrentLocation,
  NEARBY_RADIUS_KM,
  type LatLng,
  type PickedLocation,
} from "@/lib/geolocation";

// Leaflet touches `window` on import, so the map only loads in the browser.
const PinMap = dynamic(() => import("./PinMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-border/40" />,
});

interface LocationPickerProps {
  /** The confirmed location; undefined until the user confirms one. */
  value?: PickedLocation;
  onChange: (location: PickedLocation) => void;
  /** e.g. "Where do you need home tuition?" */
  title: string;
  description?: string;
  /** Red "*" after the title; the parent form still decides whether to block submit. */
  required?: boolean;
  /** Italic "(optional)" after the title. */
  optional?: boolean;
  className?: string;
}

/** Centre of India, for "Pick on map" when nothing better is known. */
const INDIA_CENTER: LatLng = { lat: 22.9734, lng: 78.6569 };

const SOURCE_LABEL: Record<NonNullable<PickedLocation["source"]>, string> = {
  gps: "Current location",
  address_search: "Searched place",
  map_pin: "Pinned on map",
};

/**
 * "Where is tuition needed?" — three ways in (device GPS, Geoapify place search, or a pin on the map), then the
 * user checks the pin on a map, drags it if needed, and confirms. Nothing is passed to `onChange` until they
 * confirm. A poor GPS fix (> 2 km, typical of laptops) can't be confirmed until the pin is moved or a place is
 * searched. Without a Geoapify key it degrades to GPS only.
 */
export function LocationPicker(props: LocationPickerProps) {
  return <PickerBody {...props} mapsEnabled={!!GEOAPIFY_API_KEY} />;
}

type Draft = PickedLocation & {
  /** Must be moved/searched before it can be confirmed (poor GPS fix, or a blank "pick on map"). */
  needsAdjust?: boolean;
  /** Bumped when the map should re-centre on the draft (not when the user drags the pin). */
  focus: number;
};

function PickerBody({
  value,
  onChange,
  title,
  description,
  required,
  optional,
  className,
  mapsEnabled,
}: LocationPickerProps & { mapsEnabled: boolean }) {
  const [editing, setEditing] = useState(!value);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function withAddress(next: Draft) {
    setDraft(next);
    if (!mapsEnabled || next.address) return;
    const address = await reverseGeocode(next);
    if (address) setDraft((current) => (current && current.lat === next.lat && current.lng === next.lng ? { ...current, address } : current));
  }

  async function useCurrentLocation() {
    setError(null);
    setLocating(true);
    try {
      const position = await getCurrentLocation();
      const poor = accuracyLevel(position.accuracyMeters) === "poor";
      if (poor && !mapsEnabled) {
        setError(
          `We couldn't determine your exact location (accuracy ~${formatDistance(position.accuracyMeters)}). Please try on your phone with GPS turned on.`,
        );
        return;
      }
      await withAddress({ ...position, source: "gps", needsAdjust: poor, focus: Date.now() });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLocating(false);
    }
  }

  function pickOnMap() {
    setError(null);
    const start = draft ?? value;
    // With nothing known, start zoomed out on India; the user taps their area and zooms in.
    setDraft({ ...(start ?? INDIA_CENTER), address: undefined, source: "map_pin", needsAdjust: !start, focus: Date.now() });
  }

  function movePin(position: LatLng) {
    void withAddress({ ...position, source: "map_pin", focus: draft?.focus ?? 0 });
  }

  function confirm() {
    if (!draft || draft.needsAdjust) return;
    const { lat, lng, source, accuracyMeters, address } = draft;
    onChange({ lat, lng, source, accuracyMeters: source === "gps" ? Math.round(accuracyMeters ?? 0) : undefined, address });
    setDraft(null);
    setEditing(false);
  }

  function cancel() {
    setDraft(null);
    setError(null);
    if (value) setEditing(false);
  }

  const header = (
    <div>
      <p className="text-sm font-semibold text-text-primary">
        {title}
        {required ? <RequiredMark /> : optional ? <OptionalTag /> : null}
      </p>
      <p className="mt-0.5 text-xs text-text-secondary">
        {description ?? `Used only to match you with people within ${NEARBY_RADIUS_KM} km. Never shown publicly.`}
      </p>
    </div>
  );

  if (!editing && value) {
    return (
      <div className={cn("flex flex-col gap-3 rounded-xl border border-border bg-bg p-4", className)}>
        {header}
        <div className="flex flex-col gap-3 rounded-lg border border-success/30 bg-success/5 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-2">
            <span className="mt-0.5 text-success">
              <PinIcon />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">{value.address ?? "Location saved"}</p>
              <p className="text-xs text-text-secondary">
                {value.source ? SOURCE_LABEL[value.source] : "Saved location"}
                {value.source === "gps" && value.accuracyMeters !== undefined && ` · accuracy ±${formatDistance(value.accuracyMeters)}`}
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" pill={false} className="shrink-0" onClick={() => setEditing(true)}>
            Change
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4 rounded-xl border border-border bg-bg p-4", className)}>
      {header}

      {!draft && (
        <div className="flex flex-col gap-3">
          <Button type="button" variant="outline" pill={false} isLoading={locating} onClick={useCurrentLocation} leftIcon={<LocateIcon />}>
            {locating ? "Finding your location…" : "Use my current location"}
          </Button>
          {mapsEnabled && (
            <>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span className="h-px flex-1 bg-border" />
                OR
                <span className="h-px flex-1 bg-border" />
              </div>
              <PlaceSearch
                near={value}
                onSelect={(place) => withAddress({ ...place, source: "address_search", focus: Date.now() })}
                onError={setError}
              />
              <button
                type="button"
                onClick={pickOnMap}
                className="w-fit text-sm font-semibold text-brand-secondary hover:text-brand-primary"
              >
                Or pick it on the map →
              </button>
            </>
          )}
          {value && (
            <button type="button" onClick={cancel} className="w-fit text-xs text-text-secondary hover:text-text-primary">
              Keep my saved location
            </button>
          )}
        </div>
      )}

      {error && <p className="text-xs font-medium text-error">{error}</p>}

      {draft && (
        <div className="flex flex-col gap-3">
          {mapsEnabled && <DraftMap draft={draft} onMove={movePin} />}
          <DraftStatus draft={draft} mapsEnabled={mapsEnabled} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" pill={false} disabled={draft.needsAdjust} onClick={confirm}>
              Confirm location
            </Button>
            <Button type="button" variant="ghost" pill={false} onClick={() => setDraft(null)}>
              Choose another way
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function DraftStatus({ draft, mapsEnabled }: { draft: Draft; mapsEnabled: boolean }) {
  const level = draft.source === "gps" ? accuracyLevel(draft.accuracyMeters) : undefined;
  const accuracy = draft.accuracyMeters !== undefined ? formatDistance(draft.accuracyMeters) : undefined;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-text-primary">{draft.address ?? `${draft.lat.toFixed(5)}, ${draft.lng.toFixed(5)}`}</p>
      {level === "poor" ? (
        <p className="text-xs font-medium text-error">
          We couldn&apos;t determine your exact location (accuracy ~{accuracy}). Search your area or drag the pin to the
          right spot.
        </p>
      ) : level === "approximate" ? (
        <p className="text-xs font-medium text-warning-strong">
          Approximate location (±{accuracy}). {mapsEnabled ? "Drag the pin to your exact spot before confirming." : ""}
        </p>
      ) : level ? (
        <p className="text-xs text-success-strong">
          {level === "excellent" ? "Accurate" : "Good"} location (±{accuracy}). Check the pin, then confirm.
        </p>
      ) : draft.needsAdjust ? (
        <p className="text-xs text-text-secondary">Tap the map or drag the pin to where the tuition will happen.</p>
      ) : (
        <p className="text-xs text-text-secondary">Drag the pin if it isn&apos;t exactly right, then confirm.</p>
      )}
    </div>
  );
}

/** Map with a draggable pin; tapping the map also moves the pin. Re-centres when `draft.focus` changes. */
function DraftMap({ draft, onMove }: { draft: Draft; onMove: (position: LatLng) => void }) {
  const zoomedOut = draft.needsAdjust && draft.source === "map_pin";
  return (
    <div className="relative z-0 h-64 overflow-hidden rounded-xl border border-border sm:h-72">
      <PinMap position={{ lat: draft.lat, lng: draft.lng }} zoom={zoomedOut ? 5 : 16} focus={draft.focus} onMove={onMove} />
    </div>
  );
}

/** Geoapify autocomplete (India only, biased towards the saved location) with our own suggestion list. */
function PlaceSearch({
  near,
  onSelect,
  onError,
}: {
  near?: LatLng;
  onSelect: (place: LatLng & { address?: string }) => void;
  onError: (message: string) => void;
}) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const text = input.trim();
    if (text.length < 3) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setSuggestions(await searchPlaces(text, near, controller.signal));
        setOpen(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError")
          onError("Place search isn't available right now. Use your current location or pick on the map.");
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
    // `near` only biases ranking; re-searching when it changes isn't needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, onError]);

  // Short input shows nothing (stale results from a longer query are hidden rather than cleared in the effect).
  const visible = input.trim().length >= 3 ? suggestions : [];

  function choose(place: PlaceSuggestion) {
    setOpen(false);
    setInput(place.address);
    onSelect({ lat: place.lat, lng: place.lng, address: place.address });
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
        <SearchIcon />
      </span>
      <input
        type="search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => visible.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search your colony, village or city…"
        aria-label="Search your area"
        autoComplete="off"
        className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary/70 focus:border-brand-secondary focus-ring"
      />
      {open && input.trim().length >= 3 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border bg-surface py-1 shadow-soft">
          {visible.length === 0 ? (
            <li className="px-4 py-3 text-xs text-text-secondary">
              No places found. Try a nearby town, or pick the spot on the map.
            </li>
          ) : (
            visible.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(place)}
                  className="flex w-full flex-col items-start px-4 py-2 text-left hover:bg-bg"
                >
                  <span className="text-sm font-medium text-text-primary">{place.primary}</span>
                  {place.secondary && <span className="text-xs text-text-secondary">{place.secondary}</span>}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function LocateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <circle cx="12" cy="12" r="7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
