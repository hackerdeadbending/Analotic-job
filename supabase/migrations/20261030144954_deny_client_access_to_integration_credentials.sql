create policy "No client access to integration credentials"
on public.integration_credentials
for all
to anon, authenticated
using (false)
with check (false);
