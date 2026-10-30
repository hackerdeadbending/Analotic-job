import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getRuntimeEnv } from "@/lib/runtime-env";

export async function createClient() {
  const cookieStore = await cookies();
  const url = getRuntimeEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = getRuntimeEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (!url || !key) {
    throw new Error("Supabase environment variables are missing. Add them to your deployment settings.");
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies; middleware refreshes sessions.
        }
      },
    },
  });
}
