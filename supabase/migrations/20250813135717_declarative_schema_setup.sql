create type "public"."flight_note_type" as enum ('pilot', 'admin', 'engineer', 'witness', 'other');

create type "public"."maintenance_log_type" as enum ('build', 'maintenance', 'upgrade', 'repair', 'trouble-shooting', 'ground-run', 'other');

drop policy "user_profiles_update_own" on "public"."user_profiles";

drop policy "user_profiles_insert_own" on "public"."user_profiles";

drop policy "user_profiles_select" on "public"."user_profiles";


  create table "public"."aircraft" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "owner_id" uuid,
    "name" text,
    "version" text,
    "notes" text,
    "serial_number" text not null
      );


alter table "public"."aircraft" enable row level security;


  create table "public"."aircraft_hardware" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "aircraft_id" uuid not null,
    "json" jsonb
      );


alter table "public"."aircraft_hardware" enable row level security;


  create table "public"."aircraft_maintenance_log" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "author_id" uuid,
    "aircraft_id" uuid,
    "log_type" maintenance_log_type not null,
    "notes" text
      );


alter table "public"."aircraft_maintenance_log" enable row level security;


  create table "public"."flight_notes" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "author_id" uuid,
    "flight_run_id" uuid,
    "notes" text,
    "note_type" flight_note_type not null
      );


alter table "public"."flight_notes" enable row level security;


  create table "public"."flight_run" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "pilot_id" uuid not null,
    "aircraft_id" uuid not null,
    "location" text,
    "altitude_m" integer,
    "temp_c" smallint,
    "title" text,
    "description" text
      );


alter table "public"."flight_run" enable row level security;


  create table "public"."flight_run_logs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "flight_run_id" uuid,
    "uploaded_by_id" uuid,
    "size_bytes" bigint,
    "bucket" text not null default 'flight-logs'::text,
    "object_path" text not null,
    "content_type" text,
    "checksum_sha256" text
      );


alter table "public"."flight_run_logs" enable row level security;


  create table "public"."flight_run_tags" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "run_id" uuid not null,
    "tag_id" uuid not null,
    "tagged_by_id" uuid
      );


alter table "public"."flight_run_tags" enable row level security;


  create table "public"."tags" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "created_by_id" uuid,
    "name" text not null,
    "description" text
      );


alter table "public"."tags" enable row level security;

CREATE UNIQUE INDEX aircraft_hardware_pkey ON public.aircraft_hardware USING btree (id);

CREATE UNIQUE INDEX aircraft_maintenance_log_pkey ON public.aircraft_maintenance_log USING btree (id);

CREATE UNIQUE INDEX aircraft_pkey ON public.aircraft USING btree (id);

CREATE UNIQUE INDEX aircraft_serial_number_key ON public.aircraft USING btree (serial_number);

CREATE UNIQUE INDEX flight_notes_pkey ON public.flight_notes USING btree (id);

CREATE UNIQUE INDEX flight_run_logs_pkey ON public.flight_run_logs USING btree (id);

CREATE UNIQUE INDEX flight_run_pkey ON public.flight_run USING btree (id);

CREATE UNIQUE INDEX flight_run_tags_pkey ON public.flight_run_tags USING btree (id);

CREATE UNIQUE INDEX flight_run_tags_unique ON public.flight_run_tags USING btree (tag_id, run_id);

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

alter table "public"."aircraft" add constraint "aircraft_pkey" PRIMARY KEY using index "aircraft_pkey";

alter table "public"."aircraft_hardware" add constraint "aircraft_hardware_pkey" PRIMARY KEY using index "aircraft_hardware_pkey";

alter table "public"."aircraft_maintenance_log" add constraint "aircraft_maintenance_log_pkey" PRIMARY KEY using index "aircraft_maintenance_log_pkey";

alter table "public"."flight_notes" add constraint "flight_notes_pkey" PRIMARY KEY using index "flight_notes_pkey";

alter table "public"."flight_run" add constraint "flight_run_pkey" PRIMARY KEY using index "flight_run_pkey";

alter table "public"."flight_run_logs" add constraint "flight_run_logs_pkey" PRIMARY KEY using index "flight_run_logs_pkey";

alter table "public"."flight_run_tags" add constraint "flight_run_tags_pkey" PRIMARY KEY using index "flight_run_tags_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."aircraft" add constraint "aircraft_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES user_profiles(id) not valid;

alter table "public"."aircraft" validate constraint "aircraft_owner_id_fkey";

alter table "public"."aircraft" add constraint "aircraft_serial_number_key" UNIQUE using index "aircraft_serial_number_key";

alter table "public"."aircraft_hardware" add constraint "aircraft_hardware_aircraft_id_fkey" FOREIGN KEY (aircraft_id) REFERENCES aircraft(id) ON DELETE CASCADE not valid;

alter table "public"."aircraft_hardware" validate constraint "aircraft_hardware_aircraft_id_fkey";

alter table "public"."aircraft_maintenance_log" add constraint "aircraft_maintenance_log_aircraft_id_fkey" FOREIGN KEY (aircraft_id) REFERENCES aircraft(id) ON DELETE CASCADE not valid;

alter table "public"."aircraft_maintenance_log" validate constraint "aircraft_maintenance_log_aircraft_id_fkey";

alter table "public"."aircraft_maintenance_log" add constraint "aircraft_maintenance_log_author_id_fkey" FOREIGN KEY (author_id) REFERENCES user_profiles(id) not valid;

alter table "public"."aircraft_maintenance_log" validate constraint "aircraft_maintenance_log_author_id_fkey";

alter table "public"."flight_notes" add constraint "flight_notes_author_id_fkey" FOREIGN KEY (author_id) REFERENCES user_profiles(id) not valid;

alter table "public"."flight_notes" validate constraint "flight_notes_author_id_fkey";

alter table "public"."flight_notes" add constraint "flight_notes_flight_run_id_fkey" FOREIGN KEY (flight_run_id) REFERENCES flight_run(id) not valid;

alter table "public"."flight_notes" validate constraint "flight_notes_flight_run_id_fkey";

alter table "public"."flight_run" add constraint "flight_run_aircraft_id_fkey" FOREIGN KEY (aircraft_id) REFERENCES aircraft(id) not valid;

alter table "public"."flight_run" validate constraint "flight_run_aircraft_id_fkey";

alter table "public"."flight_run" add constraint "flight_run_pilot_id_fkey" FOREIGN KEY (pilot_id) REFERENCES user_profiles(id) not valid;

alter table "public"."flight_run" validate constraint "flight_run_pilot_id_fkey";

alter table "public"."flight_run_logs" add constraint "flight_run_logs_flight_run_id_fkey" FOREIGN KEY (flight_run_id) REFERENCES flight_run(id) ON DELETE CASCADE not valid;

alter table "public"."flight_run_logs" validate constraint "flight_run_logs_flight_run_id_fkey";

alter table "public"."flight_run_logs" add constraint "flight_run_logs_uploaded_by_id_fkey" FOREIGN KEY (uploaded_by_id) REFERENCES user_profiles(id) not valid;

alter table "public"."flight_run_logs" validate constraint "flight_run_logs_uploaded_by_id_fkey";

alter table "public"."flight_run_tags" add constraint "flight_run_tags_run_id_fkey" FOREIGN KEY (run_id) REFERENCES flight_run(id) not valid;

alter table "public"."flight_run_tags" validate constraint "flight_run_tags_run_id_fkey";

alter table "public"."flight_run_tags" add constraint "flight_run_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) not valid;

alter table "public"."flight_run_tags" validate constraint "flight_run_tags_tag_id_fkey";

alter table "public"."flight_run_tags" add constraint "flight_run_tags_tagged_by_id_fkey" FOREIGN KEY (tagged_by_id) REFERENCES user_profiles(id) not valid;

alter table "public"."flight_run_tags" validate constraint "flight_run_tags_tagged_by_id_fkey";

alter table "public"."flight_run_tags" add constraint "flight_run_tags_unique" UNIQUE using index "flight_run_tags_unique";

alter table "public"."tags" add constraint "tags_created_by_id_fkey" FOREIGN KEY (created_by_id) REFERENCES user_profiles(id) not valid;

alter table "public"."tags" validate constraint "tags_created_by_id_fkey";

alter table "public"."tags" add constraint "tags_name_key" UNIQUE using index "tags_name_key";

create or replace view "public"."flight_run_tags_with_tags" as  SELECT flight_run_tags.id,
    flight_run_tags.created_at,
    flight_run_tags.updated_at,
    flight_run_tags.run_id,
    flight_run_tags.tag_id,
    flight_run_tags.tagged_by_id,
    tags.name AS tag_name,
    tags.description AS tag_description
   FROM (flight_run_tags
     JOIN tags ON ((flight_run_tags.tag_id = tags.id)));


grant delete on table "public"."aircraft" to "anon";

grant insert on table "public"."aircraft" to "anon";

grant references on table "public"."aircraft" to "anon";

grant select on table "public"."aircraft" to "anon";

grant trigger on table "public"."aircraft" to "anon";

grant truncate on table "public"."aircraft" to "anon";

grant update on table "public"."aircraft" to "anon";

grant delete on table "public"."aircraft" to "authenticated";

grant insert on table "public"."aircraft" to "authenticated";

grant references on table "public"."aircraft" to "authenticated";

grant select on table "public"."aircraft" to "authenticated";

grant trigger on table "public"."aircraft" to "authenticated";

grant truncate on table "public"."aircraft" to "authenticated";

grant update on table "public"."aircraft" to "authenticated";

grant delete on table "public"."aircraft" to "service_role";

grant insert on table "public"."aircraft" to "service_role";

grant references on table "public"."aircraft" to "service_role";

grant select on table "public"."aircraft" to "service_role";

grant trigger on table "public"."aircraft" to "service_role";

grant truncate on table "public"."aircraft" to "service_role";

grant update on table "public"."aircraft" to "service_role";

grant delete on table "public"."aircraft_hardware" to "anon";

grant insert on table "public"."aircraft_hardware" to "anon";

grant references on table "public"."aircraft_hardware" to "anon";

grant select on table "public"."aircraft_hardware" to "anon";

grant trigger on table "public"."aircraft_hardware" to "anon";

grant truncate on table "public"."aircraft_hardware" to "anon";

grant update on table "public"."aircraft_hardware" to "anon";

grant delete on table "public"."aircraft_hardware" to "authenticated";

grant insert on table "public"."aircraft_hardware" to "authenticated";

grant references on table "public"."aircraft_hardware" to "authenticated";

grant select on table "public"."aircraft_hardware" to "authenticated";

grant trigger on table "public"."aircraft_hardware" to "authenticated";

grant truncate on table "public"."aircraft_hardware" to "authenticated";

grant update on table "public"."aircraft_hardware" to "authenticated";

grant delete on table "public"."aircraft_hardware" to "service_role";

grant insert on table "public"."aircraft_hardware" to "service_role";

grant references on table "public"."aircraft_hardware" to "service_role";

grant select on table "public"."aircraft_hardware" to "service_role";

grant trigger on table "public"."aircraft_hardware" to "service_role";

grant truncate on table "public"."aircraft_hardware" to "service_role";

grant update on table "public"."aircraft_hardware" to "service_role";

grant delete on table "public"."aircraft_maintenance_log" to "anon";

grant insert on table "public"."aircraft_maintenance_log" to "anon";

grant references on table "public"."aircraft_maintenance_log" to "anon";

grant select on table "public"."aircraft_maintenance_log" to "anon";

grant trigger on table "public"."aircraft_maintenance_log" to "anon";

grant truncate on table "public"."aircraft_maintenance_log" to "anon";

grant update on table "public"."aircraft_maintenance_log" to "anon";

grant delete on table "public"."aircraft_maintenance_log" to "authenticated";

grant insert on table "public"."aircraft_maintenance_log" to "authenticated";

grant references on table "public"."aircraft_maintenance_log" to "authenticated";

grant select on table "public"."aircraft_maintenance_log" to "authenticated";

grant trigger on table "public"."aircraft_maintenance_log" to "authenticated";

grant truncate on table "public"."aircraft_maintenance_log" to "authenticated";

grant update on table "public"."aircraft_maintenance_log" to "authenticated";

grant delete on table "public"."aircraft_maintenance_log" to "service_role";

grant insert on table "public"."aircraft_maintenance_log" to "service_role";

grant references on table "public"."aircraft_maintenance_log" to "service_role";

grant select on table "public"."aircraft_maintenance_log" to "service_role";

grant trigger on table "public"."aircraft_maintenance_log" to "service_role";

grant truncate on table "public"."aircraft_maintenance_log" to "service_role";

grant update on table "public"."aircraft_maintenance_log" to "service_role";

grant delete on table "public"."flight_notes" to "anon";

grant insert on table "public"."flight_notes" to "anon";

grant references on table "public"."flight_notes" to "anon";

grant select on table "public"."flight_notes" to "anon";

grant trigger on table "public"."flight_notes" to "anon";

grant truncate on table "public"."flight_notes" to "anon";

grant update on table "public"."flight_notes" to "anon";

grant delete on table "public"."flight_notes" to "authenticated";

grant insert on table "public"."flight_notes" to "authenticated";

grant references on table "public"."flight_notes" to "authenticated";

grant select on table "public"."flight_notes" to "authenticated";

grant trigger on table "public"."flight_notes" to "authenticated";

grant truncate on table "public"."flight_notes" to "authenticated";

grant update on table "public"."flight_notes" to "authenticated";

grant delete on table "public"."flight_notes" to "service_role";

grant insert on table "public"."flight_notes" to "service_role";

grant references on table "public"."flight_notes" to "service_role";

grant select on table "public"."flight_notes" to "service_role";

grant trigger on table "public"."flight_notes" to "service_role";

grant truncate on table "public"."flight_notes" to "service_role";

grant update on table "public"."flight_notes" to "service_role";

grant delete on table "public"."flight_run" to "anon";

grant insert on table "public"."flight_run" to "anon";

grant references on table "public"."flight_run" to "anon";

grant select on table "public"."flight_run" to "anon";

grant trigger on table "public"."flight_run" to "anon";

grant truncate on table "public"."flight_run" to "anon";

grant update on table "public"."flight_run" to "anon";

grant delete on table "public"."flight_run" to "authenticated";

grant insert on table "public"."flight_run" to "authenticated";

grant references on table "public"."flight_run" to "authenticated";

grant select on table "public"."flight_run" to "authenticated";

grant trigger on table "public"."flight_run" to "authenticated";

grant truncate on table "public"."flight_run" to "authenticated";

grant update on table "public"."flight_run" to "authenticated";

grant delete on table "public"."flight_run" to "service_role";

grant insert on table "public"."flight_run" to "service_role";

grant references on table "public"."flight_run" to "service_role";

grant select on table "public"."flight_run" to "service_role";

grant trigger on table "public"."flight_run" to "service_role";

grant truncate on table "public"."flight_run" to "service_role";

grant update on table "public"."flight_run" to "service_role";

grant delete on table "public"."flight_run_logs" to "anon";

grant insert on table "public"."flight_run_logs" to "anon";

grant references on table "public"."flight_run_logs" to "anon";

grant select on table "public"."flight_run_logs" to "anon";

grant trigger on table "public"."flight_run_logs" to "anon";

grant truncate on table "public"."flight_run_logs" to "anon";

grant update on table "public"."flight_run_logs" to "anon";

grant delete on table "public"."flight_run_logs" to "authenticated";

grant insert on table "public"."flight_run_logs" to "authenticated";

grant references on table "public"."flight_run_logs" to "authenticated";

grant select on table "public"."flight_run_logs" to "authenticated";

grant trigger on table "public"."flight_run_logs" to "authenticated";

grant truncate on table "public"."flight_run_logs" to "authenticated";

grant update on table "public"."flight_run_logs" to "authenticated";

grant delete on table "public"."flight_run_logs" to "service_role";

grant insert on table "public"."flight_run_logs" to "service_role";

grant references on table "public"."flight_run_logs" to "service_role";

grant select on table "public"."flight_run_logs" to "service_role";

grant trigger on table "public"."flight_run_logs" to "service_role";

grant truncate on table "public"."flight_run_logs" to "service_role";

grant update on table "public"."flight_run_logs" to "service_role";

grant delete on table "public"."flight_run_tags" to "anon";

grant insert on table "public"."flight_run_tags" to "anon";

grant references on table "public"."flight_run_tags" to "anon";

grant select on table "public"."flight_run_tags" to "anon";

grant trigger on table "public"."flight_run_tags" to "anon";

grant truncate on table "public"."flight_run_tags" to "anon";

grant update on table "public"."flight_run_tags" to "anon";

grant delete on table "public"."flight_run_tags" to "authenticated";

grant insert on table "public"."flight_run_tags" to "authenticated";

grant references on table "public"."flight_run_tags" to "authenticated";

grant select on table "public"."flight_run_tags" to "authenticated";

grant trigger on table "public"."flight_run_tags" to "authenticated";

grant truncate on table "public"."flight_run_tags" to "authenticated";

grant update on table "public"."flight_run_tags" to "authenticated";

grant delete on table "public"."flight_run_tags" to "service_role";

grant insert on table "public"."flight_run_tags" to "service_role";

grant references on table "public"."flight_run_tags" to "service_role";

grant select on table "public"."flight_run_tags" to "service_role";

grant trigger on table "public"."flight_run_tags" to "service_role";

grant truncate on table "public"."flight_run_tags" to "service_role";

grant update on table "public"."flight_run_tags" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";


  create policy "Authenticated users can create aircraft"
  on "public"."aircraft"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Users can update own aircraft"
  on "public"."aircraft"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id))
with check ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Users can view own aircraft"
  on "public"."aircraft"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = owner_id));



  create policy "Users can view hardware for own aircraft"
  on "public"."aircraft_hardware"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM aircraft
  WHERE ((aircraft.id = aircraft_hardware.aircraft_id) AND (aircraft.owner_id = ( SELECT auth.uid() AS uid))))));



  create policy "Users can create maintenance logs"
  on "public"."aircraft_maintenance_log"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = author_id));



  create policy "Users can view maintenance logs for own aircraft"
  on "public"."aircraft_maintenance_log"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM aircraft
  WHERE ((aircraft.id = aircraft_maintenance_log.aircraft_id) AND (aircraft.owner_id = ( SELECT auth.uid() AS uid))))));



  create policy "Users can create flight notes"
  on "public"."flight_notes"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = author_id));



  create policy "Users can update own flight notes"
  on "public"."flight_notes"
  as permissive
  for update
  to public
using ((( SELECT auth.uid() AS uid) = author_id))
with check ((( SELECT auth.uid() AS uid) = author_id));



  create policy "Users can view own flight notes"
  on "public"."flight_notes"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = author_id));



  create policy "Users can create flight runs"
  on "public"."flight_run"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = pilot_id));



  create policy "Users can update own flight runs"
  on "public"."flight_run"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = pilot_id))
with check ((( SELECT auth.uid() AS uid) = pilot_id));



  create policy "Users can view own flight runs"
  on "public"."flight_run"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = pilot_id));



  create policy "Users can create flight run logs"
  on "public"."flight_run_logs"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = uploaded_by_id));



  create policy "Users can update own flight run logs"
  on "public"."flight_run_logs"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = uploaded_by_id))
with check ((( SELECT auth.uid() AS uid) = uploaded_by_id));



  create policy "Users can view own flight run logs"
  on "public"."flight_run_logs"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = uploaded_by_id));



  create policy "Users can create flight run tags"
  on "public"."flight_run_tags"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = tagged_by_id));



  create policy "Users can update own flight run tags"
  on "public"."flight_run_tags"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = tagged_by_id))
with check ((( SELECT auth.uid() AS uid) = tagged_by_id));



  create policy "Users can view own flight run tags"
  on "public"."flight_run_tags"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = tagged_by_id));



  create policy "Authenticated users can create tags"
  on "public"."tags"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = created_by_id));



  create policy "Users can update own tags"
  on "public"."tags"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = created_by_id))
with check ((( SELECT auth.uid() AS uid) = created_by_id));



  create policy "Users can view tags"
  on "public"."tags"
  as permissive
  for select
  to authenticated, anon
using (true);



  create policy "Users can update own profile"
  on "public"."user_profiles"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = id))
with check ((( SELECT auth.uid() AS uid) = id));



  create policy "Users can view own profile"
  on "public"."user_profiles"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = id));



  create policy "user_profiles_insert_own"
  on "public"."user_profiles"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = id));



  create policy "user_profiles_select"
  on "public"."user_profiles"
  as permissive
  for select
  to authenticated
using (true);


CREATE TRIGGER set_updated_at_aircraft BEFORE UPDATE ON public.aircraft FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

CREATE TRIGGER set_updated_at_aircraft_hardware BEFORE UPDATE ON public.aircraft_hardware FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

CREATE TRIGGER set_updated_at_aircraft_maintenance_logs BEFORE UPDATE ON public.aircraft_maintenance_log FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

CREATE TRIGGER set_updated_at_flight_notes BEFORE UPDATE ON public.flight_notes FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

CREATE TRIGGER set_updated_at_flight_run BEFORE UPDATE ON public.flight_run FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

CREATE TRIGGER set_updated_at_flight_run_logs BEFORE UPDATE ON public.flight_run_logs FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

CREATE TRIGGER set_updated_at_flight_run_tags BEFORE UPDATE ON public.flight_run_tags FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

CREATE TRIGGER set_updated_at_tags BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');


