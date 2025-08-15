drop view if exists "public"."users_with_auth";

alter table "public"."flight_leg_logs" add column "notes" text;

alter table "public"."flight_leg_logs" add column "title" text not null;


