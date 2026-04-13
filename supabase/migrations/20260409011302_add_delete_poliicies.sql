alter table "public"."flight_notes" drop constraint "flight_notes_author_id_fkey";

alter table "public"."flight_notes" drop constraint "flight_notes_flight_leg_id_fkey";

alter table "public"."flight_notes" add constraint "flight_notes_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.user_profiles(id) ON DELETE SET NULL not valid;

alter table "public"."flight_notes" validate constraint "flight_notes_author_id_fkey";

alter table "public"."flight_notes" add constraint "flight_notes_flight_leg_id_fkey" FOREIGN KEY (flight_leg_id) REFERENCES public.flight_legs(id) ON DELETE CASCADE not valid;

alter table "public"."flight_notes" validate constraint "flight_notes_flight_leg_id_fkey";


  create policy "Users can delete own aircraft"
  on "public"."aircraft"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Users can delete own maintenance logs"
  on "public"."aircraft_maintenance_log"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = author_id));



  create policy "Users can delete own flight leg tags"
  on "public"."flight_leg_tags"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = tagged_by_id));



  create policy "Users can delete own flight runs"
  on "public"."flight_legs"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = pilot_id));



  create policy "Users can delete own flight notes"
  on "public"."flight_notes"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = author_id));



  create policy "Users can delete own tags"
  on "public"."tags"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = created_by_id));



