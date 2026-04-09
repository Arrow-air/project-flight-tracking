set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$function$
;


  create policy "All authenticated can update aircraft"
  on "public"."aircraft"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "All authenticated can view aircraft"
  on "public"."aircraft"
  as permissive
  for select
  to authenticated
using (true);



  create policy "All authenticated can update aircraft hardware"
  on "public"."aircraft_hardware"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "All authenticated can view aircraft hardware"
  on "public"."aircraft_hardware"
  as permissive
  for select
  to authenticated
using (true);



  create policy "All authenticated can update aircraft maintenance logs"
  on "public"."aircraft_maintenance_log"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "All authenticated can view aircraft maintenance logs"
  on "public"."aircraft_maintenance_log"
  as permissive
  for select
  to authenticated
using (true);



  create policy "All authenticated can update flight leg logs"
  on "public"."flight_leg_logs"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "All authenticated can view flight leg logs"
  on "public"."flight_leg_logs"
  as permissive
  for select
  to authenticated
using (true);



  create policy "All authenticated can update flight leg tags"
  on "public"."flight_leg_tags"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "All authenticated can view flight leg tags"
  on "public"."flight_leg_tags"
  as permissive
  for select
  to authenticated
using (true);



  create policy "All authenticated can update flight legs"
  on "public"."flight_legs"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "All authenticated can view flight legs"
  on "public"."flight_legs"
  as permissive
  for select
  to authenticated
using (true);



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



  create policy "auth users can read any flight logs"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'flight_logs'::text));



  create policy "auth users can update any flight logs"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'flight_logs'::text))
with check ((bucket_id = 'flight_logs'::text));



