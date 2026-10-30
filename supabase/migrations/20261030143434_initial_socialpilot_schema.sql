create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','editor','analyst')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace and wm.user_id = (select auth.uid())
  );
$$;

create table public.brand_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  slug text,
  description text,
  industry text,
  target_audience text,
  brand_voice text,
  primary_goal text,
  status text not null default 'active' check (status in ('active','paused','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_project_id uuid references public.brand_projects(id) on delete set null,
  platform text not null check (platform in ('instagram','tiktok','youtube','facebook','threads','linkedin','x','pinterest')),
  external_account_id text,
  username text,
  display_name text,
  profile_url text,
  avatar_url text,
  connection_status text not null default 'pending' check (connection_status in ('pending','connected','expired','revoked','error')),
  credential_ref text,
  token_expires_at timestamptz,
  last_synced_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, platform, external_account_id)
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_project_id uuid references public.brand_projects(id) on delete set null,
  social_account_id uuid references public.social_accounts(id) on delete set null,
  platform text check (platform in ('instagram','tiktok','youtube','facebook','threads','linkedin','x','pinterest')),
  title text,
  body text,
  content_type text not null default 'post' check (content_type in ('post','reel','story','carousel','short','video','image')),
  media_assets jsonb not null default '[]'::jsonb,
  hashtags text[] not null default '{}',
  status text not null default 'draft' check (status in ('idea','draft','in_review','approved','scheduled','publishing','published','failed','archived')),
  scheduled_at timestamptz,
  published_at timestamptz,
  external_post_id text,
  permalink text,
  ai_generated boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.publishing_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  social_account_id uuid references public.social_accounts(id) on delete set null,
  status text not null default 'queued' check (status in ('queued','processing','published','retrying','failed','cancelled')),
  scheduled_at timestamptz,
  attempts integer not null default 0,
  last_error text,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_analytics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_project_id uuid references public.brand_projects(id) on delete cascade,
  social_account_id uuid references public.social_accounts(id) on delete cascade,
  platform text not null,
  metric_date date not null,
  followers integer,
  followers_delta integer,
  impressions bigint,
  reach bigint,
  engagements bigint,
  likes bigint,
  comments bigint,
  shares bigint,
  saves bigint,
  clicks bigint,
  video_views bigint,
  raw_metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (social_account_id, metric_date)
);

create table public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_project_id uuid references public.brand_projects(id) on delete cascade,
  name text not null,
  rule_type text not null,
  enabled boolean not null default false,
  configuration jsonb not null default '{}'::jsonb,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_brand_projects_workspace on public.brand_projects(workspace_id);
create index idx_social_accounts_workspace on public.social_accounts(workspace_id);
create index idx_content_workspace_status on public.content_items(workspace_id, status);
create index idx_content_schedule on public.content_items(scheduled_at) where scheduled_at is not null;
create index idx_jobs_status_schedule on public.publishing_jobs(status, scheduled_at);
create index idx_analytics_workspace_date on public.daily_analytics(workspace_id, metric_date desc);
create index idx_activity_workspace_created on public.activity_events(workspace_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.brand_projects enable row level security;
alter table public.social_accounts enable row level security;
alter table public.content_items enable row level security;
alter table public.publishing_jobs enable row level security;
alter table public.daily_analytics enable row level security;
alter table public.automation_rules enable row level security;
alter table public.activity_events enable row level security;

create policy "Users can read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "Users can update own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "Members can view workspaces" on public.workspaces for select to authenticated using (public.is_workspace_member(id));
create policy "Owners can update workspaces" on public.workspaces for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Authenticated users can create workspaces" on public.workspaces for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "Members can view workspace members" on public.workspace_members for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "Workspace owners can manage members" on public.workspace_members for all to authenticated using (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid()))) with check (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid())));
create policy "Members can access brand projects" on public.brand_projects for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "Members can access social accounts" on public.social_accounts for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "Members can access content" on public.content_items for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "Members can access publishing jobs" on public.publishing_jobs for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "Members can access analytics" on public.daily_analytics for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "Members can access automation rules" on public.automation_rules for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "Members can read activity events" on public.activity_events for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "Members can create activity events" on public.activity_events for insert to authenticated with check (public.is_workspace_member(workspace_id));

create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  new_workspace_id uuid;
  workspace_label text;
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'));
  workspace_label := coalesce(new.raw_user_meta_data ->> 'workspace_name', 'My workspace');
  insert into public.workspaces (name, owner_id) values (workspace_label, new.id) returning id into new_workspace_id;
  insert into public.workspace_members (workspace_id, user_id, role) values (new_workspace_id, new.id, 'owner');
  return new;
end;
$$;

create trigger on_auth_user_created_socialpilot
  after insert on auth.users for each row execute procedure public.handle_new_user();

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.is_workspace_member(uuid) from public, anon;
grant execute on function public.is_workspace_member(uuid) to authenticated;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.workspaces, public.workspace_members, public.brand_projects, public.social_accounts, public.content_items, public.publishing_jobs, public.daily_analytics, public.automation_rules, public.activity_events to authenticated;
grant select, update on public.profiles to authenticated;
