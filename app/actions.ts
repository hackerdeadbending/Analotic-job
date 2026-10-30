"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createBrandProject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim();

  if (!name || name.length > 80 || description.length > 500 || industry.length > 80) {
    redirect("/projects?error=invalid");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership?.workspace_id) redirect("/projects?error=workspace");

  const { error } = await supabase.from("brand_projects").insert({
    workspace_id: membership.workspace_id,
    name,
    description: description || null,
    industry: industry || null,
  });

  if (error) redirect("/projects?error=create");
  redirect("/projects?created=1");
}


export async function createContentDraft(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const platform = String(formData.get("platform") ?? "instagram");
  const contentType = String(formData.get("content_type") ?? "post");
  const projectId = String(formData.get("brand_project_id") ?? "").trim();

  const allowedPlatforms = ["instagram", "tiktok", "youtube", "facebook", "threads", "linkedin", "x", "pinterest"];
  const allowedTypes = ["post", "reel", "story", "carousel", "short", "video", "image"];
  if (!title || title.length > 160 || body.length > 5000 || !allowedPlatforms.includes(platform) || !allowedTypes.includes(contentType)) {
    redirect("/studio?error=invalid");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership?.workspace_id) redirect("/studio?error=workspace");

  if (projectId) {
    const { data: project } = await supabase.from("brand_projects")
      .select("id")
      .eq("id", projectId)
      .eq("workspace_id", membership.workspace_id)
      .maybeSingle();
    if (!project) redirect("/studio?error=project");
  }

  const { error } = await supabase.from("content_items").insert({
    workspace_id: membership.workspace_id,
    brand_project_id: projectId || null,
    platform,
    title,
    body: body || null,
    content_type: contentType,
    status: "draft",
    created_by: user.id,
  });

  if (error) redirect("/studio?error=save");
  redirect("/studio?created=1");
}
