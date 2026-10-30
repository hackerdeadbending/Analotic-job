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
          setNotice("Перевір пошту та підтвердь адресу. Твій робочий простір буде готовий після підтвердження.");
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
      setError(caught instanceof Error ? caught.message : "Щось пішло не так. Спробуй ще раз.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link href="/" className="auth-brand"><span><Sparkles size={19}/></span>socialpilot<span className="auth-ai">.ai</span></Link>
        <div className="auth-kicker">ТВОЄ ЗРОСТАННЯ В ОДНОМУ МІСЦІ</div>
        <h1>{isSignup ? "Створи власну систему зростання." : "З поверненням!"}</h1>
        <p className="auth-intro">{isSignup ? "Створи робочий простір і зосередься на розвитку кожного бренду." : "Увійди, щоб продовжити роботу зі своїми брендами."}</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && <label>Твоє ім’я<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Твоє ім’я" required maxLength={80}/></label>}
          <label>Електронна пошта<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required/></label>
          <label>Пароль<input type="password" autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isSignup ? "Щонайменше 8 символів" : "Твій пароль"} minLength={8} required/></label>
          {searchParams.get("setup") === "1" && <p className="auth-notice" role="status">Перед входом налаштуй URL Supabase та публічний ключ у середовищі застосунку.</p>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          <button className="auth-submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17}/> : <>{isSignup ? "Створити простір" : "Увійти"} <ArrowRight size={16}/></>}</button>
        </form>
        <p className="auth-switch">{isSignup ? "Вже маєш акаунт?" : "Вперше в SocialPilot AI?"} <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Увійти" : "Створити акаунт"}</Link></p>
        <div className="auth-foot">Приватність у кожній деталі <span>·</span> Створено для тих, хто прагне більшого</div>
      </section>
      <aside className="auth-aside"><div className="auth-orbit orbit-one"/><div className="auth-orbit orbit-two"/><div className="auth-aside-content"><div className="auth-aside-icon"><Sparkles size={25}/></div><div className="auth-aside-label">АВТОНОМНИЙ ПРОСТІР ДЛЯ СОЦМЕРЕЖ</div><h2>Менше рутини.<br/>Більше справжнього зростання.</h2><p>Єдиний простір для стратегії, контенту, публікацій та аналітики.</p><div className="auth-aside-points"><span>01 <b>Плануй разом з AI</b></span><span>02 <b>Створюй зі змістом</b></span><span>03 <b>Розвивай усі канали</b></span></div></div></aside>
    </main>
  );
}
