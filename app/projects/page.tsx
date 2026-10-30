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
  const { data: projectsData } = workspaceId
    ? await supabase
        .from("brand_projects")
        .select("id,name,description,industry,status,created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
    : { data: [] as Project[] };

  const projects = (projectsData ?? []) as Project[];

  return (
    <main className="projects-shell">
      <header className="projects-topbar">
        <Link href="/" className="projects-back"><ArrowLeft size={16}/> Назад до огляду</Link>
        <span className="projects-brand"><Sparkles size={16}/> socialpilot<span>.ai</span></span>
      </header>
      <div className="projects-content">
        <div className="projects-heading">
          <div>
            <div className="projects-eyebrow">ТВОЯ ЕКОСИСТЕМА БРЕНДІВ</div>
            <h1>Бренд-проєкти</h1>
            <p>Створи для кожного бренду власну стратегію, стиль, контент і підключені канали.</p>
          </div>
          <span className="projects-count">{projects.length} {projects.length === 1 ? "project" : "projects"}</span>
        </div>

        {params.created === "1" && <p className="project-feedback success">Бренд-проєкт створено.</p>}
        {params.error && <p className="project-feedback error">Не вдалося створити проєкт. Перевір дані та спробуй ще раз.</p>}

        <div className="projects-layout">
          <section className="projects-list">
            {projects.length ? projects.map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-avatar"><BriefcaseBusiness size={19}/></div>
                <div className="project-card-copy">
                  <div className="project-card-title"><h2>{project.name}</h2><span className={`project-status ${project.status}`}>{project.status}</span></div>
                  <p>{project.description || "Опис бренду ще не додано."}</p>
                  <div className="project-card-meta"><span>{project.industry || "Галузь не вказана"}</span><span>Створено {new Date(project.created_at).toLocaleDateString("uk-UA", { month: "short", day: "numeric", year: "numeric" })}</span></div>
                </div>
                <ArrowUpRight className="project-open-icon" size={17}/>
              </article>
            )) : (
              <div className="projects-empty">
                <div className="projects-empty-icon"><BriefcaseBusiness size={24}/></div>
                <h2>Твоя екосистема брендів починається тут.</h2>
                <p>Створи перший проєкт, щоб зібрати його стратегію, аудиторію, контент і соціальні акаунти в одному місці.</p>
              </div>
            )}
          </section>

          <aside className="project-create-card">
            <div className="create-card-icon"><Plus size={18}/></div>
            <h2>Створити бренд-проєкт</h2>
            <p>Почни з основ. Аудиторію та стиль бренду можна визначити пізніше.</p>
            <form action={createBrandProject} className="project-form">
              <label>Назва проєкту<input name="name" placeholder="Наприклад, особистий бренд" required maxLength={80}/></label>
              <label>Галузь <span>Необов’язково</span><input name="industry" placeholder="Наприклад, мода, фітнес, технології" maxLength={80}/></label>
              <label>Опис <span>Необов’язково</span><textarea name="description" placeholder="Про що цей бренд?" rows={3} maxLength={500}/></label>
              <button type="submit"><Plus size={15}/> Створити проєкт</button>
            </form>
            <div className="project-form-note">Кожен проєкт залишається у твоєму приватному робочому просторі.</div>
          </aside>
        </div>
      </div>
    </main>
  );
}
