alter table "public"."flight_leg_logs" drop column "title";

alter table "public"."flight_leg_logs" add column "filename" text not null;

alter table "public"."flight_leg_logs" alter column "bucket" set default 'flight_logs'::text;


