import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_ORIGIN ?? "http://localhost:3333"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;