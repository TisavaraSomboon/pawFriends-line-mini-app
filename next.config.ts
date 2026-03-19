import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.zentry.com",
      },
    ],
    // Cache optimized images for 7 days on the CDN/browser
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
};

export default nextConfig;
