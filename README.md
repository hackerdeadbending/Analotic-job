# SocialPilot AI

An autonomous social media growth workspace for creators, brands and teams.

## Product direction

SocialPilot AI brings multi-brand planning, AI strategy, content production, publishing, analytics and compliant automation into one workspace. Instagram is the first platform integration; the data model is designed to support TikTok, YouTube, Facebook, Threads, LinkedIn, X and Pinterest.

## Stack

- Next.js App Router + TypeScript
- Supabase Auth + PostgreSQL with Row Level Security
- Cloudflare Workers for scheduled/background automation and platform integrations
- Official platform APIs and OAuth flows

## Local development

1. Install Node.js 20.9+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add the Supabase project URL and publishable key.
5. Run `npm run dev`.

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_REDIRECT_URI=
INSTAGRAM_OAUTH_STATE_SECRET=
INSTAGRAM_TOKEN_ENCRYPTION_KEY=
```

Never commit service-role keys, OAuth client secrets, access tokens or refresh tokens. Instagram tokens are encrypted server-side with AES-256-GCM before storage in a table that denies all client roles; only the server-only Supabase secret key can access it. Never expose SUPABASE_SECRET_KEY, INSTAGRAM_APP_SECRET, INSTAGRAM_OAUTH_STATE_SECRET or INSTAGRAM_TOKEN_ENCRYPTION_KEY to the browser.

## Instagram setup

1. Create a Meta app and add **Instagram API with Instagram Login**.
2. Configure the Instagram Business Login redirect URI to exactly match `INSTAGRAM_REDIRECT_URI` (the callback route is `/api/integrations/instagram/callback`).
3. Add the Meta App ID and App Secret to the server environment only.
4. Set `SUPABASE_SECRET_KEY` to the project's server-only secret key.
5. Generate an independent OAuth state secret (at least 32 characters) and a 32-byte AES key encoded as 64 hexadecimal characters.
6. Deploy the app, set the public app URL and callback URI, then test with an Instagram Business or Creator account.

The initial Instagram Login scopes are `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_comments` and `instagram_business_manage_messages`. Access to production users and advanced permissions may require Meta App Review.

## Safety principles

- Use official APIs and user-authorized OAuth scopes.
- No fake engagement, spam, mass-following or scraping behind authentication.
- Keep publishing approvals configurable.
- Require explicit confirmation for destructive actions and ad-budget changes.
- Keep every brand project and connected account isolated within its workspace.

## Current status

- [x] Initial responsive dashboard shell
- [x] Supabase project provisioned in Frankfurt
- [x] Multi-workspace database foundation with Row Level Security
- [x] Security-definer RPC permissions hardened
- [x] Email authentication screens and cookie-based session handling
- [x] Protected dashboard routes and secure sign-out
- [x] Workspace-aware dashboard identity
- [x] Brand project listing and creation
- [x] GitHub Actions lint/build workflow
- [x] Brand project listing and creation
- [x] Instagram Login OAuth routes and account connection UI
- [x] Server-side AES-256-GCM token encryption and client-denied credential storage
- [ ] Content studio and calendar
- [ ] Publishing queue and Cloudflare worker
- [ ] Analytics and AI growth recommendations
