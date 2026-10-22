"use client";

import { useEffect, useState, type ComponentType } from "react";
import type { ToastOptions } from "react-toastify";
import { ApiError } from "@/lib/api-client";

/**
 * react-toastify is only downloaded when the first notification is shown, not with every page. A toast fired
 * before the container has mounted is queued by react-toastify and shown as soon as it mounts.
 */
let mountContainer: (() => void) | null = null;
let containerWanted = false;

/** Mount once in the root layout; every `notify` call renders here. */
export function Toaster() {
  const [Container, setContainer] = useState<ComponentType | null>(null);
  useEffect(() => {
    mountContainer = () =>
      void import("./ToastContainer").then(({ AppToastContainer }) => setContainer(() => AppToastContainer));
    if (containerWanted) mountContainer();
    return () => {
      mountContainer = null;
    };
  }, []);
  return Container ? <Container /> : null;
}

function show(type: "success" | "error" | "info", message: string, options?: ToastOptions) {
  if (!containerWanted) {
    containerWanted = true;
    mountContainer?.();
  }
  void import("react-toastify").then(({ toast }) => toast[type](message, options));
}

/**
 * App-wide notifications for API outcomes. Pass the message the API sent back (`res.message`, or the caught
 * error) so users read the server's own wording; the fallback is only for responses that carry none.
 */
export const notify = {
  success(message: string | undefined, fallback = "Done.") {
    show("success", message || fallback);
  },
  error(error: unknown, fallback = "Something went wrong. Please try again.") {
    show("error", error instanceof ApiError ? error.message : typeof error === "string" ? error : fallback);
  },
  info(message: string, options?: ToastOptions) {
    show("info", message, options);
  },
};
