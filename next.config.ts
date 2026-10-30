import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
};

// Cloudflare bindings are only needed by the local Next.js dev server.
// Initializing the dev proxy during production builds makes CI require a
// Cloudflare API token just to compile the application.
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

export default nextConfig;
