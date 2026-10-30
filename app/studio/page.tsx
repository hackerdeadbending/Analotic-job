import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FileText, Instagram, Layers3, Plus, Sparkles } from "lucide-react";
import { createContentDraft } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { AIContentStudio } from "@/components/ai-content-studio";

type Project = { id: string; name: string };
type ContentItem = {
  id: string;
  title: string;
  body: string | null;
  platform: string | null;
  content_type: string;
  status: string;
  created_at: string;
  brand_project_id: string | null;
};

const statusLabels: Record<string, string> = {
  idea: "Idea", draft: "Draft", in_review: "In review", approved: "Approved",
  scheduled: "Scheduled", publishing: "Publishing", published: "Published", failed: "Failed",
};

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("workspace_members")
    .select("workspace_id").eq("user_id", user.id).limit(1).maybeSingle();
  const workspaceId = membership?.workspace_id;

  const [{ data: projectsData }, { data: contentData }] = await Promise.all([
    workspaceId
      ? supabase.from("brand_projects").select("id,name").eq("workspace_id", workspaceId).eq("status", "active").order("name")
      : Promise.resolve({ data: [] as Project[] }),
    workspaceId
      ? supabase.from("content_матеріалів").select("id,title,body,platform,content_type,status,created_at,brand_project_id").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(30)
      : Promise.resolve({ data: [] as ContentItem[] }),
  ]);

  const projects = (projectsData ?? []) as Project[];
  const матеріалів = (contentData ?? []) as ContentItem[];

  return (
    <main className="studio-shell">
      <header className="studio-topbar">
        <Link href="/" className="projects-back"><ArrowLeft size={16}/> Назад до огляду</Link>
        <span className="projects-brand"><Sparkles size={16}/> socialpilot<span>.ai</span></span>
      </header>
      <div className="studio-content">
        <div className="studio-heading">
          <div><div className="projects-eyebrow">СТВОРЮЙ ЗІ СЕНСОМ</div><h1>Студія контенту</h1><p>Перетворюй ідеї на готовий для платформ контент і зберігай усі чернетки в одному місці.</p></div>
          <span className="studio-count"><Layers3 size={15}/>{матеріалів.length} останні чернетки</span>
        </div>

        {params.created === "1" && <p className="project-feedback success">Чернетку збережено у твоєму просторі.</p>}
        {params.error && <p className="project-feedback error">{params.error === "project" ? "Цей бренд-проєкт недоступний у цьому просторі." : params.error === "workspace" ? "Не знайдено активного робочого простору." : "Не вдалося зберегти чернетку. Перевір поля та спробуй ще раз."}</p>}

        <AIContentStudio projects={projects} />\n\n        <div className="studio-layout">
          <section className="studio-editor">
            <div className="studio-card-heading"><div className="studio-icon"><Sparkles size={18}/></div><div><h2>Нова чернетка контенту</h2><p>Почни з чіткої ідеї. Ти зможеш допрацювати її будь-коли.</p></div></div>
            <form action={createContentDraft} className="studio-form">
              <label>Назва контенту<input name="title" placeholder="Наприклад, 5 звичок, які змінили мої ранки" required maxLength={160}/></label>
              <div className="studio-form-row">
                <label>Канал<select name="platform" defaultValue="instagram"><option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="youtube">YouTube</option><option value="facebook">Facebook</option><option value="threads">Threads</option><option value="linkedin">LinkedIn</option><option value="x">X</option><option value="pinterest">Pinterest</option></select></label>
                <label>Формат<select name="content_type" defaultValue="post"><option value="post">Post</option><option value="reel">Reel</option><option value="story">Story</option><option value="carousel">Carousel</option><option value="short">Short</option><option value="video">Video</option><option value="image">Image</option></select></label>
              </div>
              <label>Бренд-проєкт <span>Необов’язково</span><select name="brand_project_id" defaultValue=""><option value="">Чернетка для всього простору</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
              <label>Підпис / творче завдання <span>Необов’язково · 5,000 characters</span><textarea name="body" rows={8} maxLength={5000} placeholder="Напиши підпис, опиши ідею, додай гачок або залиш нотатки для команди..."/></label>
              <div className="studio-form-footer"><span><FileText size={14}/> Збережеться як приватна чернетка</span><button type="submit"><Plus size={15}/> Зберегти чернетку</button></div>
            </form>
          </section>

          <aside className="studio-side">
            <div className="studio-tip"><div><Sparkles size={17}/><span>ТВОРЧИЙ ПРОЦЕС</span></div><h3>Одна ідея. Сильніша присутність.</h3><p>Зберігай гачки, підписи та творчі завдання разом. Публікації й AI-генерація спиратимуться на цю бібліотеку.</p></div>
            <div className="studio-checklist"><h3>Перед публікацією</h3><ul><li>Переконайся, що перший рядок привертає увагу</li><li>Одна чітка думка в кожному дописі</li><li>Додай простий і природний заклик до дії</li><li>Добирай формат відповідно до каналу</li></ul></div>
            <Link href="/accounts" className="studio-connect"><Instagram size={16}/> Керувати підключеними каналами</Link>
          </aside>
        </div>

        <section className="studio-library">
          <div className="studio-library-heading"><div><h2>Твоя бібліотека контенту</h2><p>Нещодавні ідеї та чернетки з цього простору.</p></div><span>{матеріалів.length} матеріалів</span></div>
          {матеріалів.length ? <div className="studio-матеріалів">{матеріалів.map((item) => (
            <article className="studio-item" key={item.id}>
              <div className="studio-item-icon"><FileText size={18}/></div>
              <div className="studio-item-main"><h3>{item.title}</h3><p>{item.body || "Підпис або опис ще не додано."}</p><div><span>{item.platform || "Unassigned channel"}</span><i>·</i><span>{item.content_type}</span><i>·</i><span>{new Date(item.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span></div></div>
              <span className={`studio-status status-${item.status}`}>{statusLabels[item.status] || item.status}</span>
            </article>
          ))}</div> : <div className="studio-empty"><FileText size={22}/><h3>Твоя бібліотека контенту is ready.</h3><p>Створи першу чернетку — і вона з’явиться тут.</p></div>}
        </section>
      </div>
    </main>
  );
}
