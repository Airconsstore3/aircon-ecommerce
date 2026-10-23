import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.18.171"],
  experimental: {
    serverActions: {
      // The IDE browser preview proxies the dev server, so the Origin
      // header won't match x-forwarded-host without these.
      allowedOrigins: ["127.0.0.1:63487", "localhost:63487"],
    },
  },
  async redirects() {
    return [
      { source: "/deals", destination: "/", permanent: true },
      { source: "/deals/:path*", destination: "/", permanent: true },
    ];
  },
  images: {
    qualities: [75, 90, 100],
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