"use client";

import { useEffect, useState } from "react";
import { catalogApi, type CatalogOptions } from "@/lib/api/catalog";
import { BOARD_OPTIONS, CLASS_OPTIONS, QUALIFICATION_OPTIONS, SUBJECT_OPTIONS } from "@/lib/constants";

/** Shown until the API answers (or if it can't): the lists the catalog was seeded with. */
const FALLBACK: CatalogOptions = {
  classes: CLASS_OPTIONS,
  subjects: SUBJECT_OPTIONS,
  boards: BOARD_OPTIONS,
  qualifications: QUALIFICATION_OPTIONS,
};

let cache: CatalogOptions | null = null;
let pending: Promise<CatalogOptions> | null = null;

function load(): Promise<CatalogOptions> {
  pending ??= catalogApi
    .options()
    .then(({ classes, subjects, boards, qualifications }) => (cache = { classes, subjects, boards, qualifications }))
    .catch(() => {
      pending = null; // allow a retry on the next mount
      return FALLBACK;
    });
  return pending;
}

/** Forget the cached options, e.g. after an admin edits the catalog. */
export function invalidateCatalog() {
  cache = null;
  pending = null;
}

/**
 * Admin-managed dropdown options (classes, subjects, boards, qualifications), fetched once per page load and
 * shared by every form. The API validates submitted values against the same catalog.
 */
export function useCatalog(): CatalogOptions {
  const [options, setOptions] = useState<CatalogOptions>(cache ?? FALLBACK);
  useEffect(() => {
    if (cache) return;
    let active = true;
    void load().then((loaded) => {
      if (active) setOptions(loaded);
    });
    return () => {
      active = false;
    };
  }, []);
  return options;
}
