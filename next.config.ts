import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["argon2", "pg", "midtrans-client", "web-push", "minio", "ioredis"],
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons", "recharts"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "http", hostname: "localhost", port: "9000" },
      ...(process.env.MINIO_ENDPOINT && process.env.MINIO_ENDPOINT !== "localhost"
        ? [{ protocol: "https" as const, hostname: process.env.MINIO_ENDPOINT }]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
