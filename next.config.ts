import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true
  },
  output: "export",
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
};

export default nextConfig;
