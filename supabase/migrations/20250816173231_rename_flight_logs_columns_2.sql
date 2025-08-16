
  create policy "Users can delete own flight leg logs"
  on "public"."flight_leg_logs"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = uploaded_by_id));



