-- Broad read/update policies for 'flight_logs' bucket
-- WARNING: Grants any authenticated user read and update access to object metadata in this bucket

drop policy if exists "auth users can read any flight logs" on storage.objects;
create policy "auth users can read any flight logs"
on storage.objects
for select
to authenticated
using (bucket_id = 'flight_logs');

drop policy if exists "auth users can update any flight logs" on storage.objects;
create policy "auth users can update any flight logs"
on storage.objects
for update
to authenticated
using (bucket_id = 'flight_logs')
with check (bucket_id = 'flight_logs');

