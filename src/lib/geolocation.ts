import type { GeoPoint, LocationMeta } from "@/types/api";

export type LatLng = { lat: number; lng: number };

/** How a location was found; mirrors the API's LOCATION_SOURCES. */
export type LocationSource = "gps" | "address_search" | "map_pin";

/** A location the user confirmed on the map, in the shape the API accepts as `location`. */
export interface PickedLocation extends LatLng {
  source?: LocationSource;
  /** GPS accuracy radius in metres (GPS only). */
  accuracyMeters?: number;
  address?: string;
}

/** Server-side distance rule (common/geo NEARBY_RADIUS_KM): tutors and students are matched within this many km. */
export const NEARBY_RADIUS_KM = 10;

/** GeoJSON [lng, lat] as stored by the API -> {lat, lng} as sent to it. */
export function fromGeoPoint(point?: GeoPoint): LatLng | undefined {
  return point ? { lat: point.coordinates[1], lng: point.coordinates[0] } : undefined;
}

/** A saved profile/request location (point + meta) -> the picker's value. */
export function toPickedLocation(point?: GeoPoint, meta?: LocationMeta): PickedLocation | undefined {
  const latLng = fromGeoPoint(point);
  return latLng && { ...latLng, source: meta?.source, accuracyMeters: meta?.accuracyMeters, address: meta?.address };
}

/**
 * GPS accuracy bands. Laptops report Wi-Fi/IP estimates that can be kilometres off, so anything worse than
 * 2 km is never accepted as-is: the user must search their area or move the pin.
 */
export function accuracyLevel(meters?: number): "excellent" | "good" | "approximate" | "poor" {
  if (meters === undefined || meters <= 100) return "excellent";
  if (meters <= 500) return "good";
  if (meters <= 2000) return "approximate";
  return "poor";
}

export function formatDistance(meters: number) {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

function readPosition(options: PositionOptions): Promise<LatLng & { accuracyMeters: number }> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
        }),
      reject,
      options,
    ),
  );
}

/**
 * Asks the browser for the device position (the browser shows its own permission prompt). Tries GPS-grade
 * accuracy first, then falls back to network-based accuracy: laptops without GPS often time out on the first.
 * Only works on HTTPS or localhost.
 */
export async function getCurrentLocation(): Promise<LatLng & { accuracyMeters: number }> {
  if (typeof window !== "undefined" && !window.isSecureContext)
    throw new Error("Location only works on a secure (https) connection.");
  if (typeof navigator === "undefined" || !navigator.geolocation)
    throw new Error("Your browser can't share its location.");
  try {
    return await readPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  } catch (first) {
    const error = first as GeolocationPositionError;
    if (error.code === error.PERMISSION_DENIED)
      throw new Error("Location access is blocked. Allow it for this site in your browser settings, or search your area instead.");
    try {
      return await readPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
    } catch {
      throw new Error("Couldn't get your location. Search your area or pick it on the map instead.");
    }
  }
}
