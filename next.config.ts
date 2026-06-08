import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the dev overlay so it never bleeds into visual-regression snapshots.
  devIndicators: false,
};

export default nextConfig;
