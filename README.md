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
```

Never commit service-role keys, OAuth client secrets, access tokens or refresh tokens. Social credentials must be handled server-side and stored in a secure secret vault; the browser should only receive safe account metadata.

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
- [ ] Authentication screens and session handling
- [ ] Brand/project management
- [ ] Instagram OAuth connection
- [ ] Content studio and calendar
- [ ] Publishing queue and Cloudflare worker
- [ ] Analytics and AI growth recommendations
