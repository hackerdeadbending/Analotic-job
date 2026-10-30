import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createInstagramStateCookie, instagramOAuthConfigured, instagramRedirectUri } from "@/lib/integrations/instagram";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  if (!instagramOAuthConfigured()) {
    return NextResponse.redirect(new URL("/accounts?error=instagram_setup", request.url));
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership?.workspace_id) {
    return NextResponse.redirect(new URL("/accounts?error=workspace", request.url));
  }

  const projectId = request.nextUrl.searchParams.get("project");
  if (projectId) {
    const { data: project } = await supabase
      .from("brand_projects")
      .select("id")
      .eq("id", projectId)
      .eq("workspace_id", membership.workspace_id)
      .maybeSingle();
    if (!project) return NextResponse.redirect(new URL("/accounts?error=project", request.url));
  }

  const state = randomBytes(32).toString("base64url");
  const callback = instagramRedirectUri(request.url);
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: callback,
    response_type: "code",
    scope: [
      "instagram_business_basic",
      "instagram_business_content_publish",
      "instagram_business_manage_comments",
      "instagram_business_manage_messages",
    ].join(","),
    state,
    enable_fb_login: "0",
    force_authentication: "1",
  });

  const response = NextResponse.redirect(`https://www.instagram.com/oauth/authorize?${params.toString()}`);
  const cookie = createInstagramStateCookie({
    state,
    userId: user.id,
    workspaceId: membership.workspace_id,
    projectId,
    createdAt: Date.now(),
  });
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/integrations/instagram",
    maxAge: 600,
  });
  return response;
}
