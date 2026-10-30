import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, Plus, Sparkles } from "lucide-react";
import { createBrandProject } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

type Project = {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  status: "active" | "paused" | "archived";
  created_at: string;
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
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

  const workspaceId = membership?.workspace_id;
  const { data: проєктsData } = workspaceId
    ? await supabase
        .from("brand_проєктs")
        .select("id,name,description,industry,status,created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
    : { data: [] as Project[] };

  const проєктs = (проєктsData ?? []) as Project[];

  return (
    <main className="проєктs-shell">
      <header className="проєктs-topbar">
        <Link href="/" className="проєктs-back"><ArrowLeft size={16}/> Назад до огляду</Link>
        <span className="проєктs-brand"><Sparkles size={16}/> socialpilot<span>.ai</span></span>
      </header>
      <div className="проєктs-content">
        <div className="проєктs-heading">
          <div>
            <div className="проєктs-eyebrow">ТВОЯ ЕКОСИСТЕМА БРЕНДІВ</div>
            <h1>Бренд-проєкти</h1>
            <p>Створи для кожного бренду власну стратегію, стиль, контент і підключені канали.</p>
          </div>
          <span className="проєктs-count">{проєктs.length} {проєктs.length === 1 ? "проєкт" : "проєктs"}</span>
        </div>

        {params.created === "1" && <p className="проєкт-feedback success">Your brand проєкт has been created.</p>}
        {params.error && <p className="проєкт-feedback error">We couldn&apos;t create that проєкт. Check the details and try again.</p>}

        <div className="проєктs-layout">
          <section className="проєктs-list">
            {проєктs.length ? проєктs.map((проєкт) => (
              <article className="проєкт-card" key={проєкт.id}>
                <div className="проєкт-avatar"><BriefcaseBusiness size={19}/></div>
                <div className="проєкт-card-copy">
                  <div className="проєкт-card-title"><h2>{проєкт.name}</h2><span className={`проєкт-status ${проєкт.status}`}>{проєкт.status}</span></div>
                  <p>{проєкт.description || "Опис бренду ще не додано."}</p>
                  <div className="проєкт-card-meta"><span>{проєкт.industry || "Галузь не вказана"}</span><span>Створено {new Date(проєкт.created_at).toLocaleDateString("uk-UA", { month: "short", day: "numeric", year: "numeric" })}</span></div>
                </div>
                <ArrowUpRight className="проєкт-open-icon" size={17}/>
              </article>
            )) : (
              <div className="проєктs-empty">
                <div className="проєктs-empty-icon"><BriefcaseBusiness size={24}/></div>
                <h2>Твоя екосистема брендів починається тут.</h2>
                <p>Create your first проєкт to give its strategy, audience, content and social accounts a dedicated home.</p>
              </div>
            )}
          </section>

          <aside className="проєкт-create-card">
            <div className="create-card-icon"><Plus size={18}/></div>
            <h2>Create a brand проєкт</h2>
            <p>Почни з основ. Аудиторію та стиль бренду можна визначити пізніше.</p>
            <form action={createBrandProject} className="проєкт-form">
              <label>Назва проєкту<input name="name" placeholder="Наприклад, особистий бренд" required maxLength={80}/></label>
              <label>Галузь <span>Необов’язково</span><input name="industry" placeholder="Наприклад, мода, фітнес, технології" maxLength={80}/></label>
              <label>Опис <span>Необов’язково</span><textarea name="description" placeholder="Про що цей бренд?" rows={3} maxLength={500}/></label>
              <button type="submit"><Plus size={15}/> Create проєкт</button>
            </form>
            <div className="проєкт-form-note">Each проєкт stays inside your private workspace.</div>
          </aside>
        </div>
      </div>
    </main>
  );
}
