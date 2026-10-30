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
        <Link href="/" className="projects-back"><ArrowLeft size={16}/> Back to overview</Link>
        <span className="projects-brand"><Sparkles size={16}/> socialpilot<span>.ai</span></span>
      </header>
      <div className="projects-content">
        <div className="projects-heading">
          <div>
            <div className="projects-eyebrow">YOUR BRAND ECOSYSTEM</div>
            <h1>Brand projects</h1>
            <p>Give every brand its own strategy, voice, content and connected channels.</p>
          </div>
          <span className="projects-count">{projects.length} {projects.length === 1 ? "project" : "projects"}</span>
        </div>

        {params.created === "1" && <p className="project-feedback success">Your brand project has been created.</p>}
        {params.error && <p className="project-feedback error">We couldn't create that project. Check the details and try again.</p>}

        <div className="projects-layout">
          <section className="projects-list">
            {projects.length ? projects.map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-avatar"><BriefcaseBusiness size={19}/></div>
                <div className="project-card-copy">
                  <div className="project-card-title"><h2>{project.name}</h2><span className={`project-status ${project.status}`}>{project.status}</span></div>
                  <p>{project.description || "No brand description yet."}</p>
                  <div className="project-card-meta"><span>{project.industry || "Industry not set"}</span><span>Created {new Date(project.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span></div>
                </div>
                <ArrowUpRight className="project-open-icon" size={17}/>
              </article>
            )) : (
              <div className="projects-empty">
                <div className="projects-empty-icon"><BriefcaseBusiness size={24}/></div>
                <h2>Your brand universe starts here.</h2>
                <p>Create your first project to give its strategy, audience, content and social accounts a dedicated home.</p>
              </div>
            )}
          </section>

          <aside className="project-create-card">
            <div className="create-card-icon"><Plus size={18}/></div>
            <h2>Create a brand project</h2>
            <p>Start with the basics. You can define your audience and brand voice later.</p>
            <form action={createBrandProject} className="project-form">
              <label>Project name<input name="name" placeholder="e.g. Personal Brand" required maxLength={80}/></label>
              <label>Industry <span>Optional</span><input name="industry" placeholder="e.g. Fashion, Fitness, Tech" maxLength={80}/></label>
              <label>Description <span>Optional</span><textarea name="description" placeholder="What is this brand about?" rows={3} maxLength={500}/></label>
              <button type="submit"><Plus size={15}/> Create project</button>
            </form>
            <div className="project-form-note">Each project stays inside your private workspace.</div>
          </aside>
        </div>
      </div>
    </main>
  );
}
