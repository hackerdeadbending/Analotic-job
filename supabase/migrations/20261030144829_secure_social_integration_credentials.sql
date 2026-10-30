create table public.integration_credentials (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  social_account_id uuid not null unique references public.social_accounts(id) on delete cascade,
  provider text not null check (provider in ('instagram')),
  encrypted_access_token text not null,
  encryption_iv text not null,
  encryption_tag text not null,
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_integration_credentials_workspace on public.integration_credentials(workspace_id);
alter table public.integration_credentials enable row level security;
revoke all on public.integration_credentials from anon, authenticated;
grant select, insert, update, delete on public.integration_credentials to service_role;
