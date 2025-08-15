
  create policy "auth users can insert flight logs"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'flight_logs'::text));



  create policy "owner can delete their flight logs"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'flight_logs'::text) AND (( SELECT auth.uid() AS uid) = (owner_id)::uuid)));



  create policy "owner can read their flight logs"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'flight_logs'::text) AND (( SELECT auth.uid() AS uid) = (owner_id)::uuid)));



  create policy "owner can update their flight logs"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'flight_logs'::text) AND (( SELECT auth.uid() AS uid) = (owner_id)::uuid)))
with check (((bucket_id = 'flight_logs'::text) AND (( SELECT auth.uid() AS uid) = (owner_id)::uuid)));



