import type { NextConfig } from "next";
import { execSync } from "child_process";

let commitSha = "unknown";
try {
  commitSha = execSync("git rev-parse HEAD").toString().trim();
} catch {
  // not a git repo or git unavailable at build time
}

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    COMMIT_SHA: commitSha,
  },
};

export default nextConfig;
