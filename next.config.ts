import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.18.171"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // TypeScript and ESLint errors are no longer ignored
  // Build will fail on type errors and linting issues
};

export default nextConfig;