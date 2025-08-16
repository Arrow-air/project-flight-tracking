
  create policy "All authenticated can update flight notes"
  on "public"."flight_notes"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "All authenticated can view flight notes"
  on "public"."flight_notes"
  as permissive
  for select
  to authenticated
using (true);



