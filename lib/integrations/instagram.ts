import "server-only";
import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const STATE_COOKIE = "socialpilot_ig_oauth";

function stateSecret() {
  const secret = process.env.INSTAGRAM_OAUTH_STATE_SECRET;
  if (!secret || secret.length < 32) throw new Error("Instagram OAuth state secret is not configured.");
  return secret;
}

function encryptionKey() {
  const value = process.env.INSTAGRAM_TOKEN_ENCRYPTION_KEY ?? "";
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new Error("Instagram token encryption key must be 64 hexadecimal characters.");
  return Buffer.from(value, "hex");
}

export type InstagramOAuthState = {
  state: string;
  userId: string;
  workspaceId: string;
  projectId: string | null;
  createdAt: number;
};

export function createInstagramStateCookie(payload: InstagramOAuthState) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", stateSecret()).update(encoded).digest("base64url");
  return { name: STATE_COOKIE, value: encoded + "." + signature };
}

export function verifyInstagramStateCookie(value: string | undefined, state: string | null) {
  if (!value || !state) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;
  const expected = createHmac("sha256", stateSecret()).update(encoded).digest();
  let received: Buffer;
  try { received = Buffer.from(signature, "base64url"); } catch { return null; }
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as InstagramOAuthState;
    if (payload.state !== state || Date.now() - payload.createdAt > 10 * 60 * 1000 || payload.createdAt > Date.now() + 30_000) return null;
    if (!payload.userId || !payload.workspaceId) return null;
    return payload;
  } catch {
    return null;
  }
}

export function encryptInstagramToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return {
    encrypted_access_token: encrypted.toString("base64"),
    encryption_iv: iv.toString("base64"),
    encryption_tag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptInstagramToken(record: {
  encrypted_access_token: string;
  encryption_iv: string;
  encryption_tag: string;
}) {
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(record.encryption_iv, "base64"));
  decipher.setAuthTag(Buffer.from(record.encryption_tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(record.encrypted_access_token, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function instagramRedirectUri(requestUrl: string) {
  const configured = process.env.INSTAGRAM_REDIRECT_URI;
  return configured || new URL("/api/integrations/instagram/callback", requestUrl).toString();
}

export function instagramOAuthConfigured() {
  return Boolean(
    process.env.INSTAGRAM_APP_ID &&
    process.env.INSTAGRAM_APP_SECRET &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SECRET_KEY &&
    process.env.INSTAGRAM_OAUTH_STATE_SECRET &&
    process.env.INSTAGRAM_TOKEN_ENCRYPTION_KEY
  );
}
