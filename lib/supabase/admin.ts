import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getRuntimeEnv } from "@/lib/runtime-env";

export function createAdminClient() {
  const url = getRuntimeEnv("NEXT_PUBLIC_SUPABASE_URL");
  const secretKey = getRuntimeEnv("SUPABASE_SECRET_KEY");

  if (!url || !secretKey) {
    throw new Error("Supabase server secret is not configured.");
  }

  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
