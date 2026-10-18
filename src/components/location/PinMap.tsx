"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { GEOAPIFY_ATTRIBUTION, GEOAPIFY_TILE_URL } from "@/lib/geoapify";
import type { LatLng } from "@/lib/geolocation";

interface PinMapProps {
  position: LatLng;
  zoom: number;
  /** Change this to re-centre the map on `position` (a new search/GPS result), but not on every drag. */
  focus: number;
  onMove: (position: LatLng) => void;
}

// Leaflet's default marker images don't survive bundling, so the pin is an inline SVG.
const PIN_ICON = L.divIcon({
  className: "",
  html: `<svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))"><path d="M18 43s15-13.4 15-25A15 15 0 0 0 3 18c0 11.6 15 25 15 25Z" fill="#0b3d32"/><circle cx="18" cy="18" r="6" fill="#fff"/></svg>`,
  iconSize: [36, 44],
  iconAnchor: [18, 43],
});

/**
 * Leaflet map (Geoapify tiles) with one draggable pin; tapping the map also moves the pin. Browser-only:
 * import it through next/dynamic with `ssr: false`.
 */
export default function PinMap({ position, zoom, focus, onMove }: PinMapProps) {
  const handlers = useMemo(
    () => ({
      dragend(event: L.DragEndEvent) {
        const { lat, lng } = (event.target as L.Marker).getLatLng();
        onMove({ lat, lng });
      },
    }),
    [onMove],
  );
  return (
    <MapContainer center={position} zoom={zoom} scrollWheelZoom className="h-full w-full">
      <TileLayer url={GEOAPIFY_TILE_URL} attribution={GEOAPIFY_ATTRIBUTION} maxZoom={20} />
      <Marker position={position} draggable icon={PIN_ICON} eventHandlers={handlers} />
      <ClickToMove onMove={onMove} />
      <Recenter position={position} zoom={zoom} focus={focus} />
    </MapContainer>
  );
}

function ClickToMove({ onMove }: { onMove: (position: LatLng) => void }) {
  useMapEvents({ click: (event) => onMove({ lat: event.latlng.lat, lng: event.latlng.lng }) });
  return null;
}

function Recenter({ position, zoom, focus }: { position: LatLng; zoom: number; focus: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, zoom);
    // Only when a new place/GPS fix arrives (focus), not on every drag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, focus]);
  return null;
}
