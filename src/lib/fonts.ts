import { Caveat, Noto_Sans_Devanagari, Plus_Jakarta_Sans, Sora } from "next/font/google";

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

/**
 * Hindi copy (home page, FAQ, the tutor request form). Neither Latin font has Devanagari glyphs, so this one sits
 * second in the body and display stacks: Latin text keeps its font, Devanagari falls through to this. Variable, so
 * one file covers every weight.
 */
export const devanagariFont = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  display: "swap",
});

/**
 * Handwritten accent, used sparingly (e.g. the "@nextutorhub" handle in Highlights). Every use is bold, so only 700
 * is loaded: asking for 600 + 700 made Google serve the whole variable font (73 KB, preloaded on every page).
 */
export const scriptFont = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
  weight: "700",
});
