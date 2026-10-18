"use client";

import { Bounce, ToastContainer, toast } from "react-toastify";
import { ApiError } from "@/lib/api-client";

/** Mount once in the root layout; every `notify` call renders here. */
export function Toaster() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      theme="light"
      transition={Bounce}
      toastClassName="!rounded-xl !font-sans !text-sm"
    />
  );
}

/**
 * App-wide notifications for API outcomes. Pass the message the API sent back (`res.message`, or the caught
 * error) so users read the server's own wording; the fallback is only for responses that carry none.
 */
export const notify = {
  success(message: string | undefined, fallback = "Done.") {
    toast.success(message || fallback);
  },
  error(error: unknown, fallback = "Something went wrong. Please try again.") {
    toast.error(error instanceof ApiError ? error.message : typeof error === "string" ? error : fallback);
  },
};
