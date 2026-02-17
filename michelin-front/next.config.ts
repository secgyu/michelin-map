import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "static.prod.r53.tablethotels.com",
      },
      {
        protocol: "https",
        hostname: "**.michelin.com",
      },
    ],
  },
};

export default nextConfig;
