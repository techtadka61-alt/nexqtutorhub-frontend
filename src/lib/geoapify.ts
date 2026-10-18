import type { LatLng } from "@/lib/geolocation";

/** Geoapify key (place search, reverse geocoding, map tiles). Without it the location picker is GPS-only. */
export const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? "";

const BASE = "https://api.geoapify.com/v1/geocode";

/** Map tiles for Leaflet; `{r}` serves @2x tiles on high-DPI screens. */
export const GEOAPIFY_TILE_URL = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}{r}.png?apiKey=${GEOAPIFY_API_KEY}`;
export const GEOAPIFY_ATTRIBUTION =
  'Powered by <a href="https://www.geoapify.com/" target="_blank" rel="noreferrer">Geoapify</a> | © <a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

export interface PlaceSuggestion extends LatLng {
  id: string;
  /** Full one-line address. */
  address: string;
  /** Short name (locality, street, place) and the rest of the address, for a two-line list item. */
  primary: string;
  secondary?: string;
}

interface GeoapifyResult {
  place_id?: string;
  lat: number;
  lon: number;
  formatted?: string;
  address_line1?: string;
  address_line2?: string;
}

async function call(path: string, params: Record<string, string>, signal?: AbortSignal): Promise<GeoapifyResult[]> {
  const query = new URLSearchParams({ ...params, format: "json", lang: "en", apiKey: GEOAPIFY_API_KEY });
  const res = await fetch(`${BASE}/${path}?${query}`, { signal });
  if (!res.ok) throw new Error(`Geoapify ${path} failed (${res.status})`);
  return ((await res.json()) as { results?: GeoapifyResult[] }).results ?? [];
}

/** Places in India matching what the user typed, biased towards `near` when known. */
export async function searchPlaces(text: string, near?: LatLng, signal?: AbortSignal): Promise<PlaceSuggestion[]> {
  const results = await call(
    "autocomplete",
    { text, filter: "countrycode:in", limit: "6", ...(near && { bias: `proximity:${near.lng},${near.lat}` }) },
    signal,
  );
  return results.map((result, index) => ({
    id: result.place_id ?? `${result.lat},${result.lon},${index}`,
    lat: result.lat,
    lng: result.lon,
    address: result.formatted ?? [result.address_line1, result.address_line2].filter(Boolean).join(", "),
    primary: result.address_line1 ?? result.formatted ?? "",
    secondary: result.address_line2,
  }));
}

/** Coordinates -> a readable address (best effort: undefined on any failure). */
export async function reverseGeocode({ lat, lng }: LatLng): Promise<string | undefined> {
  try {
    const [first] = await call("reverse", { lat: String(lat), lon: String(lng) });
    return first?.formatted;
  } catch {
    return undefined;
  }
}
