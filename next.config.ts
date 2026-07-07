import type { NextConfig } from "next";

// NEXT_DISABLE_BUILD_CHECKS is a local-dev-only escape hatch (RECONCILIATION.md D4).
// It must never be set in CI — leaving it unset means CI enforces both ESLint and
// TypeScript errors as build failures.
const disableBuildChecks = process.env.NEXT_DISABLE_BUILD_CHECKS === "true";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: disableBuildChecks,
  },
  typescript: {
    ignoreBuildErrors: disableBuildChecks,
  },
};

export default nextConfig;
