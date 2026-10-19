import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NexTutorHub — Home Tuition in Sonbhadra",
    short_name: "NexTutorHub",
    description: "Find verified home tutors near you in Sonbhadra, Uttar Pradesh.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8faf9",
    theme_color: "#0b3d32",
    lang: "en-IN",
    icons: [{ src: "/logo.png", sizes: "1235x655", type: "image/png" }],
  };
}
