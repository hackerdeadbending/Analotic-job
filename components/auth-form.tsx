"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = { mode: "login" | "signup" };

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignup = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const supabase = createClient();
      if (isSignup) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: "https://analotic-job.solopro-laf.workers.dev/auth/callback",
          },
        });
        if (authError) throw authError;
        if (data.session) {
          router.replace("/");
          router.refresh();
        } else {
          setNotice("Check your inbox to confirm your email address. Your workspace will be ready as soon as you verify it.");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
        const next = searchParams.get("next");
        router.replace(next?.startsWith("/") ? next : "/");
        router.refresh();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link href="/" className="auth-brand"><span><Sparkles size={19}/></span>socialpilot<span className="auth-ai">.ai</span></Link>
        <div className="auth-kicker">YOUR GROWTH, IN ONE PLACE</div>
        <h1>{isSignup ? "Build your growth engine." : "Welcome back."}</h1>
        <p className="auth-intro">{isSignup ? "Create your workspace and bring every brand into focus." : "Sign in to pick up where your brands left off."}</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && <label>Your name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" required maxLength={80}/></label>}
          <label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required/></label>
          <label>Password<input type="password" autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isSignup ? "At least 8 characters" : "Your password"} minLength={8} required/></label>
          {searchParams.get("setup") === "1" && <p className="auth-notice" role="status">Connect your Supabase URL and publishable key in the app environment before signing in.</p>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          <button className="auth-submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17}/> : <>{isSignup ? "Create workspace" : "Sign in"} <ArrowRight size={16}/></>}</button>
        </form>
        <p className="auth-switch">{isSignup ? "Already have an account?" : "New to SocialPilot AI?"} <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Sign in" : "Create an account"}</Link></p>
        <div className="auth-foot">Private by design <span>·</span> Built for ambitious creators</div>
      </section>
      <aside className="auth-aside"><div className="auth-orbit orbit-one"/><div className="auth-orbit orbit-two"/><div className="auth-aside-content"><div className="auth-aside-icon"><Sparkles size={25}/></div><div className="auth-aside-label">THE AUTONOMOUS SOCIAL WORKSPACE</div><h2>Less busywork.<br/>More meaningful growth.</h2><p>One calm command center for your strategy, content, publishing and performance.</p><div className="auth-aside-points"><span>01 <b>Think with AI</b></span><span>02 <b>Create with intention</b></span><span>03 <b>Grow across channels</b></span></div></div></aside>
    </main>
  );
}
