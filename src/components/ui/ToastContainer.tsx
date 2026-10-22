"use client";

import { Bounce, ToastContainer } from "react-toastify";

/** Loaded on demand by <Toaster> (see Toast.tsx) so react-toastify stays out of every page's initial bundle. */
export function AppToastContainer() {
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
