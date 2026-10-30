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
