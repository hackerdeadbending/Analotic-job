import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink, Instagram, Plus, ShieldCheck, Sparkles, Unplug } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type SocialAccount = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  profile_url: string | null;
  connection_status: string;
  token_expires_at: string | null;
  last_synced_at: string | null;
  created_at: string;
};

const errors: Record<string, string> = {
  instagram_setup: "Інтеграцію Instagram ще не налаштовано. Додай облікові дані Meta та секрети шифрування до середовища розгортання.",
  instagram_state: "Сеанс авторизації Instagram завершився або не пройшов перевірку. Спробуй підключитися ще раз.",
  instagram_denied: "Авторизацію Instagram скасовано.",
  instagram_code: "Instagram не повернув код авторизації.",
  instagram_exchange: "Не вдалося обміняти авторизацію Instagram на токен доступу.",
  instagram_long_token: "Instagram не видав довготривалий токен доступу.",
  instagram_profile: "Не вдалося отримати дані твого професійного акаунта Instagram.",
  instagram_save: "Instagram дозволив підключення, але SocialPilot не зміг безпечно зберегти акаунт.",
  workspace: "Для цього акаунта не знайдено активного робочого простору.",
  project: "Обраний бренд-проєкт не належить до цього робочого простору.",
};

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; підключено?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const { data } = membership?.workspace_id
    ? await supabase.from("social_accounts")
        .select("id,username,display_name,avatar_url,profile_url,connection_status,token_expires_at,last_synced_at,created_at")
        .eq("workspace_id", membership.workspace_id)
        .order("created_at", { ascending: false })
    : { data: [] as SocialAccount[] };

  const accounts = (data ?? []) as SocialAccount[];

  return (
    <main className="accounts-shell">
      <header className="accounts-topbar">
        <Link href="/" className="projects-back"><ArrowLeft size={16}/> Назад до огляду</Link>
        <span className="projects-brand"><Sparkles size={16}/> socialpilot<span>.ai</span></span>
      </header>
      <div className="accounts-content">
        <div className="projects-eyebrow">ПІДКЛЮЧЕННЯ КАНАЛІВ</div>
        <div className="accounts-heading"><div><h1>Соціальні мережі</h1><p>Підключи свої канали, щоб керувати публікаціями, статистикою та повідомленнями в одному місці.</p></div><span className="accounts-counter">{accounts.length} підключено</span></div>

        {params.підключено === "instagram" && <div className="account-alert success"><CheckCircle2 size={16}/> Акаунт Instagram підключено successfully.</div>}
        {params.error && <div className="account-alert error">{errors[params.error] ?? "Під час підключення акаунта сталася помилка."}</div>}

        <section className="accounts-section">
          <div className="accounts-section-heading"><div><h2>Підключені канали</h2><p>Акаунти, доступні у твоєму просторі</p></div></div>
          {accounts.length ? <div className="accounts-grid">{accounts.map((account) => (
            <article className="підключено-account-card" key={account.id}>
              <div className="підключено-account-top"><div className="підключено-platform-icon"><Instagram size={20}/></div><span className={`підключено-status ${account.connection_status}`}>{account.connection_status === "підключено" ? "Підключено" : account.connection_status}</span></div>
              <div className="підключено-profile">
                {account.avatar_url ? <img src={account.avatar_url} alt="" className="підключено-avatar"/> : <div className="підключено-avatar-placeholder"><Instagram size={18}/></div>}
                <div><h3>{account.display_name || account.username || "Акаунт Instagram"}</h3><p>{account.username ? `@${account.username}` : "Професійний акаунт Instagram"}</p></div>
              </div>
              <div className="підключено-account-meta"><span>Instagram · Професійний</span>{account.token_expires_at && <span>Термін дії токена до {new Date(account.token_expires_at).toLocaleDateString("uk-UA", { month: "short", day: "numeric" })}</span>}</div>
              {account.profile_url && <a className="account-profile-link" href={account.profile_url} target="_blank" rel="noreferrer">Переглянути профіль Instagram <ExternalLink size={13}/></a>}
            </article>
          ))}</div> : <div className="accounts-empty"><div className="accounts-empty-icon"><Unplug size={22}/></div><h2>Тут відображатимуться твої канали.</h2><p>Підключити an Професійний акаунт Instagram to start building a real content and performance picture.</p></div>}
        </section>

        <section className="available-integrations">
          <div className="accounts-section-heading"><div><h2>Доступні інтеграції</h2><p>Почни з каналу, який хочеш розвивати насамперед.</p></div></div>
          <article className="integration-option">
            <div className="integration-logo"><Instagram size={24}/></div>
            <div className="integration-copy"><h3>Instagram</h3><p>Підключи бізнес-акаунт або акаунт автора через офіційний Instagram Login від Meta.</p><div className="integration-permissions"><span>Профіль</span><span>Публікації</span><span>Коментарі</span><span>Повідомлення</span></div></div>
            <Link href="/api/integrations/instagram/connect" className="integration-connect"><Plus size={15}/> Підключити</Link>
          </article>
          <div className="accounts-security-note"><ShieldCheck size={17}/><span>Токени доступу шифруються перед збереженням. SocialPilot запитує лише дозволи, необхідні для ввімкнених функцій. Ти можеш будь-коли відкликати доступ в Instagram.</span></div>
        </section>
      </div>
    </main>
  );
}
