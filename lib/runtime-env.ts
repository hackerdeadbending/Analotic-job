/**
 * Public Supabase configuration has safe, project-specific fallbacks because
 * NEXT_PUBLIC_* values can be absent from a Cloudflare build environment.
 * These values are intentionally public; never put the Supabase secret key here.
 */
const PUBLIC_SUPABASE_URL = "https://qhzhitcrtzhleqxnsrzy.supabase.co";
const PUBLIC_SUPABASE_KEY = "sb_publishable_P-a0Tg_rx1w5hlUETX8JsQ_hghDH_Ag";

export function getRuntimeEnv(name: string): string | undefined {
  switch (name) {
    case "NEXT_PUBLIC_SUPABASE_URL":
      return process.env.NEXT_PUBLIC_SUPABASE_URL || PUBLIC_SUPABASE_URL;
    case "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY":
      return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || PUBLIC_SUPABASE_KEY;
    case "SUPABASE_SECRET_KEY":
      return process.env.SUPABASE_SECRET_KEY || undefined;
    default:
      return undefined;
  }
}
