create schema if not exists private;
alter function public.is_workspace_member(uuid) set schema private;
revoke all on function private.is_workspace_member(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_workspace_member(uuid) to authenticated;
