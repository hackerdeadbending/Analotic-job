import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Read a setting from Next.js process.env first, then from the current
 * Cloudflare Worker request environment. The latter is important for
 * Workers runtime variables when the Node.js compatibility bridge does not
 * populate process.env for a particular execution path.
 */
export function getRuntimeEnv(name: string): string | undefined {
  const nodeValue = process.env[name];
  if (nodeValue) return nodeValue;

  try {
    const { env } = getCloudflareContext();
    const value = (env as unknown as Record<string, unknown>)[name];
    return typeof value === "string" && value.length > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}
