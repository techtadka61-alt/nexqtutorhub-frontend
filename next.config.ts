import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP for browsers without AVIF. Measured on our assets: 32–46% smaller than WebP at the same
    // visual quality (hero 750w 26 → 16 KB, logo 384w 11 → 7 KB). AVIF encodes slower, but only on a cache miss.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3001", pathname: "/api/uploads/**" },
    ],
  },
};

export default nextConfig;
