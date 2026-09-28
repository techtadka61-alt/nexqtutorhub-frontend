"use client";

import { useSyncExternalStore } from "react";

const KEY = "nth_saved_tutors";
const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedIds: string[] = EMPTY;

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {}
  // Same string -> same array, so useSyncExternalStore sees a stable snapshot.
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      cachedIds = Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : EMPTY;
    } catch {
      cachedIds = EMPTY;
    }
  }
  return cachedIds;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Tutors the student bookmarked, kept in this browser only (a per-viewer shortlist, not synced to the
 * account). Survives reloads and stays in sync across tabs.
 */
export function useSavedTutors() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY);
  function toggle(id: string) {
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    listeners.forEach((listener) => listener());
  }
  return { isSaved: (id: string) => ids.includes(id), toggle };
}
