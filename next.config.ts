import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:3001";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Matikan saat mode dev agar tidak mengganggu
});

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
