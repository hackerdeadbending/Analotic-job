import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  encryptInstagramToken,
  instagramOAuthConfigured,
  instagramRedirectUri,
  verifyInstagramStateCookie,
} from "@/lib/integrations/instagram";

export const runtime = "nodejs";

type TokenResponse = { access_token?: string; token_type?: string; expires_in?: number; user_id?: number; error_message?: string };
type InstagramProfile = { id?: string; user_id?: string; username?: string; name?: string; account_type?: string; profile_picture_url?: string };

function returnToAccounts(request: NextRequest, result: string) {
  return NextResponse.redirect(new URL(`/accounts?${result}`, request.url));
}

export async function GET(request: NextRequest) {
  const cookieName = "socialpilot_ig_oauth";
  const stateCookie = request.cookies.get(cookieName)?.value;
  const state = verifyInstagramStateCookie(stateCookie, request.nextUrl.searchParams.get("state"));
  const responseCookie = (response: NextResponse) => {
    response.cookies.set(cookieName, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/integrations/instagram", maxAge: 0 });
    return response;
  };

  if (!state) return responseCookie(returnToAccounts(request, "error=instagram_state"));
  if (request.nextUrl.searchParams.has("error")) return responseCookie(returnToAccounts(request, "error=instagram_denied"));
  if (!instagramOAuthConfigured()) return responseCookie(returnToAccounts(request, "error=instagram_setup"));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== state.userId) return responseCookie(NextResponse.redirect(new URL("/login", request.url)));

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .eq("workspace_id", state.workspaceId)
    .maybeSingle();
  if (!membership) return responseCookie(returnToAccounts(request, "error=workspace"));

  const code = request.nextUrl.searchParams.get("code");
  if (!code) return responseCookie(returnToAccounts(request, "error=instagram_code"));

  const appId = process.env.INSTAGRAM_APP_ID!;
  const appSecret = process.env.INSTAGRAM_APP_SECRET!;
  const redirectUri = instagramRedirectUri(request.url);

  try {
    const exchangeBody = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    });
    const shortResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: exchangeBody,
      cache: "no-store",
    });
    const shortToken = await shortResponse.json() as TokenResponse;
    if (!shortResponse.ok || !shortToken.access_token) {
      console.error("Instagram short token exchange failed", shortToken.error_message ?? shortResponse.status);
      return responseCookie(returnToAccounts(request, "error=instagram_exchange"));
    }

    const longParams = new URLSearchParams({
      grant_type: "ig_exchange",
      client_secret: appSecret,
      access_token: shortToken.access_token,
    });
    const longResponse = await fetch(`https://graph.instagram.com/access_token?${longParams}`, { cache: "no-store" });
    const longToken = await longResponse.json() as TokenResponse;
    if (!longResponse.ok || !longToken.access_token) {
      console.error("Instagram long token exchange failed", longResponse.status);
      return responseCookie(returnToAccounts(request, "error=instagram_long_token"));
    }

    const profileParams = new URLSearchParams({
      fields: "user_id,username,name,account_type,profile_picture_url",
      access_token: longToken.access_token,
    });
    const profileResponse = await fetch(`https://graph.instagram.com/me?${profileParams}`, { cache: "no-store" });
    const profile = await profileResponse.json() as InstagramProfile & { error?: { message?: string } };
    const externalAccountId = String(profile.user_id ?? profile.id ?? shortToken.user_id ?? "");
    if (!profileResponse.ok || !externalAccountId) {
      console.error("Instagram profile fetch failed", profile.error?.message ?? profileResponse.status);
      return responseCookie(returnToAccounts(request, "error=instagram_profile"));
    }

    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("social_accounts")
      .select("id,credential_ref")
      .eq("workspace_id", state.workspaceId)
      .eq("platform", "instagram")
      .eq("external_account_id", externalAccountId)
      .maybeSingle();

    const expiresAt = new Date(Date.now() + (longToken.expires_in ?? 5_184_000) * 1000).toISOString();
    const accountPayload = {
      workspace_id: state.workspaceId,
      brand_project_id: state.projectId,
      platform: "instagram",
      external_account_id: externalAccountId,
      username: profile.username ?? null,
      display_name: profile.name ?? profile.username ?? "Instagram account",
      profile_url: profile.username ? `https://www.instagram.com/${profile.username}/` : null,
      avatar_url: profile.profile_picture_url ?? null,
      connection_status: "connected",
      token_expires_at: expiresAt,
      last_synced_at: new Date().toISOString(),
      metadata: { account_type: profile.account_type ?? null, login_method: "instagram_login" },
      updated_at: new Date().toISOString(),
    };

    let accountId = existing?.id;
    if (accountId) {
      const { error } = await admin.from("social_accounts").update(accountPayload).eq("id", accountId).eq("workspace_id", state.workspaceId);
      if (error) throw error;
    } else {
      const { data: created, error } = await admin.from("social_accounts").insert(accountPayload).select("id").single();
      if (error) throw error;
      accountId = created.id;
    }

    const credentialId = existing?.credential_ref || crypto.randomUUID();
    const encrypted = encryptInstagramToken(longToken.access_token);
    const { error: credentialError } = await admin.from("integration_credentials").upsert({
      id: credentialId,
      workspace_id: state.workspaceId,
      social_account_id: accountId,
      provider: "instagram",
      ...encrypted,
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: "social_account_id" });
    if (credentialError) throw credentialError;

    const { error: referenceError } = await admin
      .from("social_accounts")
      .update({ credential_ref: credentialId })
      .eq("id", accountId)
      .eq("workspace_id", state.workspaceId);
    if (referenceError) throw referenceError;

    return responseCookie(returnToAccounts(request, "connected=instagram"));
  } catch (error) {
    console.error("Instagram OAuth callback failed", error instanceof Error ? error.message : "Unknown error");
    return responseCookie(returnToAccounts(request, "error=instagram_save"));
  }
}
