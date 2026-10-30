/**
 * Read configuration through statically referenced process.env properties.
 *
 * Static references are important here: Next.js can inline the public
 * Supabase values during the Cloudflare build, while
 * nodejs_compat_populate_process_env exposes Worker runtime variables to
 * server-side code. Dynamic process.env[name] access is not inlined by Next.
 */
export function getRuntimeEnv(name: string): string | undefined {
  let value: string | undefined;

  switch (name) {
    case "NEXT_PUBLIC_SUPABASE_URL":
      value = process.env.NEXT_PUBLIC_SUPABASE_URL;
      break;
    case "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY":
      value = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      break;
    case "SUPABASE_SECRET_KEY":
      value = process.env.SUPABASE_SECRET_KEY;
      break;
    default:
      value = undefined;
  }

  return value && value.length > 0 ? value : undefined;
}
