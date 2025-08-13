create extension if not exists "pg_net" with schema "extensions";

drop trigger if exists "set_updated_at_flight_run" on "public"."flight_run";

drop trigger if exists "set_updated_at_flight_run_logs" on "public"."flight_run_logs";

drop trigger if exists "set_updated_at_flight_run_tags" on "public"."flight_run_tags";

drop policy "Users can create flight runs" on "public"."flight_run";

drop policy "Users can update own flight runs" on "public"."flight_run";

drop policy "Users can view own flight runs" on "public"."flight_run";

drop policy "Users can create flight run logs" on "public"."flight_run_logs";

drop policy "Users can update own flight run logs" on "public"."flight_run_logs";

drop policy "Users can view own flight run logs" on "public"."flight_run_logs";

drop policy "Users can create flight run tags" on "public"."flight_run_tags";

drop policy "Users can update own flight run tags" on "public"."flight_run_tags";

drop policy "Users can view own flight run tags" on "public"."flight_run_tags";

revoke delete on table "public"."flight_run" from "anon";

revoke insert on table "public"."flight_run" from "anon";

revoke references on table "public"."flight_run" from "anon";

revoke select on table "public"."flight_run" from "anon";

revoke trigger on table "public"."flight_run" from "anon";

revoke truncate on table "public"."flight_run" from "anon";

revoke update on table "public"."flight_run" from "anon";

revoke delete on table "public"."flight_run" from "authenticated";

revoke insert on table "public"."flight_run" from "authenticated";

revoke references on table "public"."flight_run" from "authenticated";

revoke select on table "public"."flight_run" from "authenticated";

revoke trigger on table "public"."flight_run" from "authenticated";

revoke truncate on table "public"."flight_run" from "authenticated";

revoke update on table "public"."flight_run" from "authenticated";

revoke delete on table "public"."flight_run" from "service_role";

revoke insert on table "public"."flight_run" from "service_role";

revoke references on table "public"."flight_run" from "service_role";

revoke select on table "public"."flight_run" from "service_role";

revoke trigger on table "public"."flight_run" from "service_role";

revoke truncate on table "public"."flight_run" from "service_role";

revoke update on table "public"."flight_run" from "service_role";

revoke delete on table "public"."flight_run_logs" from "anon";

revoke insert on table "public"."flight_run_logs" from "anon";

revoke references on table "public"."flight_run_logs" from "anon";

revoke select on table "public"."flight_run_logs" from "anon";

revoke trigger on table "public"."flight_run_logs" from "anon";

revoke truncate on table "public"."flight_run_logs" from "anon";

revoke update on table "public"."flight_run_logs" from "anon";

revoke delete on table "public"."flight_run_logs" from "authenticated";

revoke insert on table "public"."flight_run_logs" from "authenticated";

revoke references on table "public"."flight_run_logs" from "authenticated";

revoke select on table "public"."flight_run_logs" from "authenticated";

revoke trigger on table "public"."flight_run_logs" from "authenticated";

revoke truncate on table "public"."flight_run_logs" from "authenticated";

revoke update on table "public"."flight_run_logs" from "authenticated";

revoke delete on table "public"."flight_run_logs" from "service_role";

revoke insert on table "public"."flight_run_logs" from "service_role";

revoke references on table "public"."flight_run_logs" from "service_role";

revoke select on table "public"."flight_run_logs" from "service_role";

revoke trigger on table "public"."flight_run_logs" from "service_role";

revoke truncate on table "public"."flight_run_logs" from "service_role";

revoke update on table "public"."flight_run_logs" from "service_role";

revoke delete on table "public"."flight_run_tags" from "anon";

revoke insert on table "public"."flight_run_tags" from "anon";

revoke references on table "public"."flight_run_tags" from "anon";

revoke select on table "public"."flight_run_tags" from "anon";

revoke trigger on table "public"."flight_run_tags" from "anon";

revoke truncate on table "public"."flight_run_tags" from "anon";

revoke update on table "public"."flight_run_tags" from "anon";

revoke delete on table "public"."flight_run_tags" from "authenticated";

revoke insert on table "public"."flight_run_tags" from "authenticated";

revoke references on table "public"."flight_run_tags" from "authenticated";

revoke select on table "public"."flight_run_tags" from "authenticated";

revoke trigger on table "public"."flight_run_tags" from "authenticated";

revoke truncate on table "public"."flight_run_tags" from "authenticated";

revoke update on table "public"."flight_run_tags" from "authenticated";

revoke delete on table "public"."flight_run_tags" from "service_role";

revoke insert on table "public"."flight_run_tags" from "service_role";

revoke references on table "public"."flight_run_tags" from "service_role";

revoke select on table "public"."flight_run_tags" from "service_role";

revoke trigger on table "public"."flight_run_tags" from "service_role";

revoke truncate on table "public"."flight_run_tags" from "service_role";

revoke update on table "public"."flight_run_tags" from "service_role";

alter table "public"."flight_notes" drop constraint "flight_notes_flight_run_id_fkey";

alter table "public"."flight_run" drop constraint "flight_run_aircraft_id_fkey";

alter table "public"."flight_run" drop constraint "flight_run_pilot_id_fkey";

alter table "public"."flight_run_logs" drop constraint "flight_run_logs_flight_run_id_fkey";

alter table "public"."flight_run_logs" drop constraint "flight_run_logs_uploaded_by_id_fkey";

alter table "public"."flight_run_tags" drop constraint "flight_run_tags_run_id_fkey";

alter table "public"."flight_run_tags" drop constraint "flight_run_tags_tag_id_fkey";

alter table "public"."flight_run_tags" drop constraint "flight_run_tags_tagged_by_id_fkey";

alter table "public"."flight_run_tags" drop constraint "flight_run_tags_unique";

drop view if exists "public"."flight_run_tags_with_tags";

alter table "public"."flight_run" drop constraint "flight_run_pkey";

alter table "public"."flight_run_logs" drop constraint "flight_run_logs_pkey";

alter table "public"."flight_run_tags" drop constraint "flight_run_tags_pkey";

drop index if exists "public"."flight_run_logs_pkey";

drop index if exists "public"."flight_run_pkey";

drop index if exists "public"."flight_run_tags_pkey";

drop index if exists "public"."flight_run_tags_unique";

drop table "public"."flight_run";

drop table "public"."flight_run_logs";

drop table "public"."flight_run_tags";


  create table "public"."flight_leg_logs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "flight_leg_id" uuid,
    "uploaded_by_id" uuid,
    "size_bytes" bigint,
    "bucket" text not null default 'flight-logs'::text,
    "object_path" text not null,
    "content_type" text,
    "checksum_sha256" text
      );


alter table "public"."flight_leg_logs" enable row level security;


  create table "public"."flight_leg_tags" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "leg_id" uuid not null,
    "tag_id" uuid not null,
    "tagged_by_id" uuid
      );


alter table "public"."flight_leg_tags" enable row level security;


  create table "public"."flight_legs" (
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


alter table "public"."flight_legs" enable row level security;

alter table "public"."flight_notes" drop column "flight_run_id";

alter table "public"."flight_notes" add column "flight_leg_id" uuid;

CREATE UNIQUE INDEX flight_leg_logs_pkey ON public.flight_leg_logs USING btree (id);

CREATE UNIQUE INDEX flight_leg_tags_pkey ON public.flight_leg_tags USING btree (id);

CREATE UNIQUE INDEX flight_leg_tags_unique ON public.flight_leg_tags USING btree (tag_id, leg_id);

CREATE UNIQUE INDEX flight_legs_pkey ON public.flight_legs USING btree (id);

alter table "public"."flight_leg_logs" add constraint "flight_leg_logs_pkey" PRIMARY KEY using index "flight_leg_logs_pkey";

alter table "public"."flight_leg_tags" add constraint "flight_leg_tags_pkey" PRIMARY KEY using index "flight_leg_tags_pkey";

alter table "public"."flight_legs" add constraint "flight_legs_pkey" PRIMARY KEY using index "flight_legs_pkey";

alter table "public"."flight_leg_logs" add constraint "flight_leg_logs_flight_leg_id_fkey" FOREIGN KEY (flight_leg_id) REFERENCES flight_legs(id) ON DELETE CASCADE not valid;

alter table "public"."flight_leg_logs" validate constraint "flight_leg_logs_flight_leg_id_fkey";

alter table "public"."flight_leg_logs" add constraint "flight_leg_logs_uploaded_by_id_fkey" FOREIGN KEY (uploaded_by_id) REFERENCES user_profiles(id) not valid;

alter table "public"."flight_leg_logs" validate constraint "flight_leg_logs_uploaded_by_id_fkey";

alter table "public"."flight_leg_tags" add constraint "flight_leg_tags_leg_id_fkey" FOREIGN KEY (leg_id) REFERENCES flight_legs(id) not valid;

alter table "public"."flight_leg_tags" validate constraint "flight_leg_tags_leg_id_fkey";

alter table "public"."flight_leg_tags" add constraint "flight_leg_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) not valid;

alter table "public"."flight_leg_tags" validate constraint "flight_leg_tags_tag_id_fkey";

alter table "public"."flight_leg_tags" add constraint "flight_leg_tags_tagged_by_id_fkey" FOREIGN KEY (tagged_by_id) REFERENCES user_profiles(id) not valid;

alter table "public"."flight_leg_tags" validate constraint "flight_leg_tags_tagged_by_id_fkey";

alter table "public"."flight_leg_tags" add constraint "flight_leg_tags_unique" UNIQUE using index "flight_leg_tags_unique";

alter table "public"."flight_legs" add constraint "flight_legs_aircraft_id_fkey" FOREIGN KEY (aircraft_id) REFERENCES aircraft(id) not valid;

alter table "public"."flight_legs" validate constraint "flight_legs_aircraft_id_fkey";

alter table "public"."flight_legs" add constraint "flight_legs_pilot_id_fkey" FOREIGN KEY (pilot_id) REFERENCES user_profiles(id) not valid;

alter table "public"."flight_legs" validate constraint "flight_legs_pilot_id_fkey";

alter table "public"."flight_notes" add constraint "flight_notes_flight_leg_id_fkey" FOREIGN KEY (flight_leg_id) REFERENCES flight_legs(id) not valid;

alter table "public"."flight_notes" validate constraint "flight_notes_flight_leg_id_fkey";

create or replace view "public"."flight_leg_tags_with_tags" as  SELECT flight_leg_tags.id,
    flight_leg_tags.created_at,
    flight_leg_tags.updated_at,
    flight_leg_tags.leg_id,
    flight_leg_tags.tag_id,
    flight_leg_tags.tagged_by_id,
    tags.name AS tag_name,
    tags.description AS tag_description
   FROM (flight_leg_tags
     JOIN tags ON ((flight_leg_tags.tag_id = tags.id)));


grant delete on table "public"."flight_leg_logs" to "anon";

grant insert on table "public"."flight_leg_logs" to "anon";

grant references on table "public"."flight_leg_logs" to "anon";

grant select on table "public"."flight_leg_logs" to "anon";

grant trigger on table "public"."flight_leg_logs" to "anon";

grant truncate on table "public"."flight_leg_logs" to "anon";

grant update on table "public"."flight_leg_logs" to "anon";

grant delete on table "public"."flight_leg_logs" to "authenticated";

grant insert on table "public"."flight_leg_logs" to "authenticated";

grant references on table "public"."flight_leg_logs" to "authenticated";

grant select on table "public"."flight_leg_logs" to "authenticated";

grant trigger on table "public"."flight_leg_logs" to "authenticated";

grant truncate on table "public"."flight_leg_logs" to "authenticated";

grant update on table "public"."flight_leg_logs" to "authenticated";

grant delete on table "public"."flight_leg_logs" to "service_role";

grant insert on table "public"."flight_leg_logs" to "service_role";

grant references on table "public"."flight_leg_logs" to "service_role";

grant select on table "public"."flight_leg_logs" to "service_role";

grant trigger on table "public"."flight_leg_logs" to "service_role";

grant truncate on table "public"."flight_leg_logs" to "service_role";

grant update on table "public"."flight_leg_logs" to "service_role";

grant delete on table "public"."flight_leg_tags" to "anon";

grant insert on table "public"."flight_leg_tags" to "anon";

grant references on table "public"."flight_leg_tags" to "anon";

grant select on table "public"."flight_leg_tags" to "anon";

grant trigger on table "public"."flight_leg_tags" to "anon";

grant truncate on table "public"."flight_leg_tags" to "anon";

grant update on table "public"."flight_leg_tags" to "anon";

grant delete on table "public"."flight_leg_tags" to "authenticated";

grant insert on table "public"."flight_leg_tags" to "authenticated";

grant references on table "public"."flight_leg_tags" to "authenticated";

grant select on table "public"."flight_leg_tags" to "authenticated";

grant trigger on table "public"."flight_leg_tags" to "authenticated";

grant truncate on table "public"."flight_leg_tags" to "authenticated";

grant update on table "public"."flight_leg_tags" to "authenticated";

grant delete on table "public"."flight_leg_tags" to "service_role";

grant insert on table "public"."flight_leg_tags" to "service_role";

grant references on table "public"."flight_leg_tags" to "service_role";

grant select on table "public"."flight_leg_tags" to "service_role";

grant trigger on table "public"."flight_leg_tags" to "service_role";

grant truncate on table "public"."flight_leg_tags" to "service_role";

grant update on table "public"."flight_leg_tags" to "service_role";

grant delete on table "public"."flight_legs" to "anon";

grant insert on table "public"."flight_legs" to "anon";

grant references on table "public"."flight_legs" to "anon";

grant select on table "public"."flight_legs" to "anon";

grant trigger on table "public"."flight_legs" to "anon";

grant truncate on table "public"."flight_legs" to "anon";

grant update on table "public"."flight_legs" to "anon";

grant delete on table "public"."flight_legs" to "authenticated";

grant insert on table "public"."flight_legs" to "authenticated";

grant references on table "public"."flight_legs" to "authenticated";

grant select on table "public"."flight_legs" to "authenticated";

grant trigger on table "public"."flight_legs" to "authenticated";

grant truncate on table "public"."flight_legs" to "authenticated";

grant update on table "public"."flight_legs" to "authenticated";

grant delete on table "public"."flight_legs" to "service_role";

grant insert on table "public"."flight_legs" to "service_role";

grant references on table "public"."flight_legs" to "service_role";

grant select on table "public"."flight_legs" to "service_role";

grant trigger on table "public"."flight_legs" to "service_role";

grant truncate on table "public"."flight_legs" to "service_role";

grant update on table "public"."flight_legs" to "service_role";


  create policy "Users can create flight leg logs"
  on "public"."flight_leg_logs"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = uploaded_by_id));



  create policy "Users can update own flight leg logs"
  on "public"."flight_leg_logs"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = uploaded_by_id))
with check ((( SELECT auth.uid() AS uid) = uploaded_by_id));



  create policy "Users can view own flight leg logs"
  on "public"."flight_leg_logs"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = uploaded_by_id));



  create policy "Users can create flight leg tags"
  on "public"."flight_leg_tags"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = tagged_by_id));



  create policy "Users can update own flight leg tags"
  on "public"."flight_leg_tags"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = tagged_by_id))
with check ((( SELECT auth.uid() AS uid) = tagged_by_id));



  create policy "Users can view own flight leg tags"
  on "public"."flight_leg_tags"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = tagged_by_id));



  create policy "Users can create flight runs"
  on "public"."flight_legs"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = pilot_id));



  create policy "Users can update own flight runs"
  on "public"."flight_legs"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = pilot_id))
with check ((( SELECT auth.uid() AS uid) = pilot_id));



  create policy "Users can view own flight runs"
  on "public"."flight_legs"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = pilot_id));


CREATE TRIGGER set_updated_at_flight_leg_logs BEFORE UPDATE ON public.flight_leg_logs FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

CREATE TRIGGER set_updated_at_flight_leg_tags BEFORE UPDATE ON public.flight_leg_tags FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

CREATE TRIGGER set_updated_at_flight_run BEFORE UPDATE ON public.flight_legs FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');


