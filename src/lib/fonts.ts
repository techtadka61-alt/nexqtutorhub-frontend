import { Caveat, Plus_Jakarta_Sans, Sora } from "next/font/google";

export const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const displayFont = Sora({
  variable: "--font-clash",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

/** Handwritten accent, used sparingly (e.g. the "@nextutorhub" handle in Highlights). */
export const scriptFont = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
});
