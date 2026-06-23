import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // هذا الخيار يسمح بنجاح عملية البناء حتى لو كان هناك أخطاء ESLint.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // هذا الخيار يسمح بنجاح عملية البناء حتى لو كان هناك أخطاء TypeScript.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
