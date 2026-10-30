import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FileText, Instagram, Layers3, Plus, Sparkles } from "lucide-react";
import { createContentDraft } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

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
      ? supabase.from("content_items").select("id,title,body,platform,content_type,status,created_at,brand_project_id").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(30)
      : Promise.resolve({ data: [] as ContentItem[] }),
  ]);

  const projects = (projectsData ?? []) as Project[];
  const items = (contentData ?? []) as ContentItem[];

  return (
    <main className="studio-shell">
      <header className="studio-topbar">
        <Link href="/" className="projects-back"><ArrowLeft size={16}/> Back to overview</Link>
        <span className="projects-brand"><Sparkles size={16}/> socialpilot<span>.ai</span></span>
      </header>
      <div className="studio-content">
        <div className="studio-heading">
          <div><div className="projects-eyebrow">CREATE WITH INTENTION</div><h1>Content studio</h1><p>Shape ideas into platform-ready content, then keep every draft organised in one place.</p></div>
          <span className="studio-count"><Layers3 size={15}/>{items.length} recent drafts</span>
        </div>

        {params.created === "1" && <p className="project-feedback success">Draft saved to your workspace.</p>}
        {params.error && <p className="project-feedback error">{params.error === "project" ? "That brand project isn't available in this workspace." : params.error === "workspace" ? "No active workspace was found." : "We couldn't save this draft. Please check the fields and try again."}</p>}

        <div className="studio-layout">
          <section className="studio-editor">
            <div className="studio-card-heading"><div className="studio-icon"><Sparkles size={18}/></div><div><h2>New content draft</h2><p>Start with a clear idea. You can refine it any time.</p></div></div>
            <form action={createContentDraft} className="studio-form">
              <label>Content title<input name="title" placeholder="e.g. 5 habits that changed my mornings" required maxLength={160}/></label>
              <div className="studio-form-row">
                <label>Channel<select name="platform" defaultValue="instagram"><option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="youtube">YouTube</option><option value="facebook">Facebook</option><option value="threads">Threads</option><option value="linkedin">LinkedIn</option><option value="x">X</option><option value="pinterest">Pinterest</option></select></label>
                <label>Format<select name="content_type" defaultValue="post"><option value="post">Post</option><option value="reel">Reel</option><option value="story">Story</option><option value="carousel">Carousel</option><option value="short">Short</option><option value="video">Video</option><option value="image">Image</option></select></label>
              </div>
              <label>Brand project <span>Optional</span><select name="brand_project_id" defaultValue=""><option value="">Workspace-wide draft</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
              <label>Caption / creative brief <span>Optional · 5,000 characters</span><textarea name="body" rows={8} maxLength={5000} placeholder="Write a caption, outline the idea, add a hook or leave notes for your team..."/></label>
              <div className="studio-form-footer"><span><FileText size={14}/> Saved as a private draft</span><button type="submit"><Plus size={15}/> Save draft</button></div>
            </form>
          </section>

          <aside className="studio-side">
            <div className="studio-tip"><div><Sparkles size={17}/><span>CREATIVE WORKFLOW</span></div><h3>One idea. A stronger presence.</h3><p>Keep your hooks, captions and creative briefs together. Publishing and AI-assisted generation will build on this library.</p></div>
            <div className="studio-checklist"><h3>Before you publish</h3><ul><li>Make the first line earn attention</li><li>Keep one clear message per post</li><li>Use a direct, natural call to action</li><li>Match the format to the channel</li></ul></div>
            <Link href="/accounts" className="studio-connect"><Instagram size={16}/> Manage connected channels</Link>
          </aside>
        </div>

        <section className="studio-library">
          <div className="studio-library-heading"><div><h2>Your content library</h2><p>Recently created ideas and drafts from this workspace.</p></div><span>{items.length} items</span></div>
          {items.length ? <div className="studio-items">{items.map((item) => (
            <article className="studio-item" key={item.id}>
              <div className="studio-item-icon"><FileText size={18}/></div>
              <div className="studio-item-main"><h3>{item.title}</h3><p>{item.body || "No caption or brief added yet."}</p><div><span>{item.platform || "Unassigned channel"}</span><i>·</i><span>{item.content_type}</span><i>·</i><span>{new Date(item.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span></div></div>
              <span className={`studio-status status-${item.status}`}>{statusLabels[item.status] || item.status}</span>
            </article>
          ))}</div> : <div className="studio-empty"><FileText size={22}/><h3>Your content library is ready.</h3><p>Create your first draft and it will appear here.</p></div>}
        </section>
      </div>
    </main>
  );
}
