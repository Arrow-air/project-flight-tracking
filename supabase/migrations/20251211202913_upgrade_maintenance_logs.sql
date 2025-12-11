alter table "public"."aircraft_maintenance_log" drop constraint "aircraft_maintenance_log_author_id_fkey";

alter table "public"."aircraft_maintenance_log" add column "log_date" date default CURRENT_DATE;

alter table "public"."aircraft_maintenance_log" add column "title" text;

alter table "public"."aircraft_maintenance_log" add constraint "aircraft_maintenance_log_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.user_profiles(id) ON DELETE SET NULL not valid;

alter table "public"."aircraft_maintenance_log" validate constraint "aircraft_maintenance_log_author_id_fkey";


