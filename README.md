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

1. Install Node.js 22+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add the required local values.
4. Run `npm run dev` for the Next.js development server.
5. Run `npm run preview` to build and test the Cloudflare Workers runtime locally (Wrangler authentication may be required for remote resources).

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

## Cloudflare deployment

The app uses the OpenNext Cloudflare adapter and deploys as a Cloudflare Worker (not a static Pages export). In Cloudflare, create a Worker connected to `hackerdeadbending/Analotic-job`, production branch `main`, root directory `/`. Configure the Workers Builds commands:

- Build command: `npx @opennextjs/cloudflare build`
- Deploy command: `npx @opennextjs/cloudflare deploy`
- Build environment: Node.js 22 and the public Supabase URL + publishable key (needed for build-time `NEXT_PUBLIC_` substitution).

Add the runtime variables/secrets in the Worker settings before testing authentication: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_REDIRECT_URI`, `INSTAGRAM_OAUTH_STATE_SECRET`, and `INSTAGRAM_TOKEN_ENCRYPTION_KEY`. Set the callback URL to `https://<your-worker-domain>/api/integrations/instagram/callback`. Keep secrets server-only; never add them to GitHub. After creating the Worker, make sure its name matches `socialpilot-ai` in `wrangler.jsonc`, or update both names together. No R2 cache is provisioned by this setup; the current app does not depend on ISR caching.

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
- [x] Cloudflare Workers deployment configuration (OpenNext)
- [ ] Cloudflare Worker deployment and runtime verification
- [ ] Content studio and calendar
- [ ] Publishing queue and Cloudflare worker
- [ ] Analytics and AI growth recommendations
