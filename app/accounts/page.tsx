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
  instagram_setup: "Instagram integration is not configured yet. Add the Meta app credentials and server encryption secrets to your deployment environment.",
  instagram_state: "The Instagram authorization session expired or could not be verified. Please try connecting again.",
  instagram_denied: "Instagram authorization was cancelled.",
  instagram_code: "Instagram did not return an authorization code.",
  instagram_exchange: "Instagram authorization could not be exchanged for an access token.",
  instagram_long_token: "Instagram did not issue a long-lived access token.",
  instagram_profile: "We couldn't read your Instagram professional account profile.",
  instagram_save: "Instagram authorized the connection, but SocialPilot couldn't save the account securely.",
  workspace: "No active workspace was found for this account.",
  project: "The selected brand project doesn't belong to this workspace.",
};

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; connected?: string }>;
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
        <Link href="/" className="projects-back"><ArrowLeft size={16}/> Back to overview</Link>
        <span className="projects-brand"><Sparkles size={16}/> socialpilot<span>.ai</span></span>
      </header>
      <div className="accounts-content">
        <div className="projects-eyebrow">CHANNEL CONNECTIONS</div>
        <div className="accounts-heading"><div><h1>Social accounts</h1><p>Connect your channels to bring publishing, insights and conversations into one workspace.</p></div><span className="accounts-counter">{accounts.length} connected</span></div>

        {params.connected === "instagram" && <div className="account-alert success"><CheckCircle2 size={16}/> Instagram account connected successfully.</div>}
        {params.error && <div className="account-alert error">{errors[params.error] ?? "Something went wrong while connecting the account."}</div>}

        <section className="accounts-section">
          <div className="accounts-section-heading"><div><h2>Connected channels</h2><p>Accounts available to your workspace</p></div></div>
          {accounts.length ? <div className="accounts-grid">{accounts.map((account) => (
            <article className="connected-account-card" key={account.id}>
              <div className="connected-account-top"><div className="connected-platform-icon"><Instagram size={20}/></div><span className={`connected-status ${account.connection_status}`}>{account.connection_status === "connected" ? "Connected" : account.connection_status}</span></div>
              <div className="connected-profile">
                {account.avatar_url ? <img src={account.avatar_url} alt="" className="connected-avatar"/> : <div className="connected-avatar-placeholder"><Instagram size={18}/></div>}
                <div><h3>{account.display_name || account.username || "Instagram account"}</h3><p>{account.username ? `@${account.username}` : "Instagram professional account"}</p></div>
              </div>
              <div className="connected-account-meta"><span>Instagram · Professional</span>{account.token_expires_at && <span>Token expires {new Date(account.token_expires_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>}</div>
              {account.profile_url && <a className="account-profile-link" href={account.profile_url} target="_blank" rel="noreferrer">View Instagram profile <ExternalLink size={13}/></a>}
            </article>
          ))}</div> : <div className="accounts-empty"><div className="accounts-empty-icon"><Unplug size={22}/></div><h2>Your channels will live here.</h2><p>Connect an Instagram professional account to start building a real content and performance picture.</p></div>}
        </section>

        <section className="available-integrations">
          <div className="accounts-section-heading"><div><h2>Available integrations</h2><p>Start with the channel you want to grow first.</p></div></div>
          <article className="integration-option">
            <div className="integration-logo"><Instagram size={24}/></div>
            <div className="integration-copy"><h3>Instagram</h3><p>Connect a Business or Creator account using Meta&apos;s official Instagram Login.</p><div className="integration-permissions"><span>Profile</span><span>Publishing</span><span>Comments</span><span>Messaging</span></div></div>
            <Link href="/api/integrations/instagram/connect" className="integration-connect"><Plus size={15}/> Connect</Link>
          </article>
          <div className="accounts-security-note"><ShieldCheck size={17}/><span>Access tokens are encrypted before storage. SocialPilot requests only the permissions needed for enabled features. You can revoke access from Instagram at any time.</span></div>
        </section>
      </div>
    </main>
  );
}
