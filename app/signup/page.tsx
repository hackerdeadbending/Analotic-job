import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return <Suspense fallback={<main className="auth-loading">Loading…</main>}><AuthForm mode="signup"/></Suspense>;
}
