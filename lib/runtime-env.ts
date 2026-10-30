import { env as cloudflareEnv } from "cloudflare:workers";

/**
 * Read runtime configuration from the Cloudflare Worker first, then fall
 * back to process.env for local development and build-time configuration.
 */
export function getRuntimeEnv(name: string): string | undefined {
  const workerValue = cloudflareEnv[name];
  if (typeof workerValue === "string" && workerValue.length > 0) {
    return workerValue;
  }

  const nodeValue = process.env[name];
  return nodeValue && nodeValue.length > 0 ? nodeValue : undefined;
}
