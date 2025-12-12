create type "public"."user_theme" as enum ('light', 'dark', 'system');

drop trigger if exists "set_updated_at_user_profiles" on "public"."user_profiles";

drop policy "Users can update own profile" on "public"."user_profiles";

drop policy "Users can view own profile" on "public"."user_profiles";

drop policy "user_profiles_insert_own" on "public"."user_profiles";

drop policy "user_profiles_select" on "public"."user_profiles";

revoke delete on table "public"."user_profiles" from "anon";

revoke insert on table "public"."user_profiles" from "anon";

revoke references on table "public"."user_profiles" from "anon";

revoke select on table "public"."user_profiles" from "anon";

revoke trigger on table "public"."user_profiles" from "anon";

revoke truncate on table "public"."user_profiles" from "anon";

revoke update on table "public"."user_profiles" from "anon";

revoke delete on table "public"."user_profiles" from "authenticated";

revoke insert on table "public"."user_profiles" from "authenticated";

revoke references on table "public"."user_profiles" from "authenticated";

revoke select on table "public"."user_profiles" from "authenticated";

revoke trigger on table "public"."user_profiles" from "authenticated";

revoke truncate on table "public"."user_profiles" from "authenticated";

revoke update on table "public"."user_profiles" from "authenticated";

drop index if exists "public"."idx_user_profiles_full_name_trgm";

alter table "public"."user_profiles" alter column "role" drop default;

alter type "public"."user_role" rename to "user_role__old_version_to_be_dropped";

create type "public"."user_role" as enum ('super_admin', 'admin', 'moderator', 'user');


  create table "public"."user_ui_settings" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "preferred_theme" public.user_theme not null default 'system'::public.user_theme,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "timezone" text,
    "locale" text
      );


alter table "public"."user_ui_settings" enable row level security;

alter table "public"."user_profiles" alter column role type "public"."user_role" using role::text::"public"."user_role";

alter table "public"."user_profiles" alter column "role" set default 'user'::public.user_role;

drop type "public"."user_role__old_version_to_be_dropped";

alter table "public"."user_profiles" add column "avatar_url" text;

alter table "public"."user_profiles" add column "display_name" text;

alter table "public"."user_profiles" add column "email" text;

alter table "public"."user_profiles" add column "is_custom_avatar" boolean not null default false;

alter table "public"."user_profiles" add column "is_deactivated" boolean not null default false;

alter table "public"."user_profiles" add column "last_login_at" timestamp with time zone default now();

alter table "public"."user_profiles" add column "onboarding_completed" boolean not null default false;

alter table "public"."user_profiles" alter column "created_at" drop not null;

alter table "public"."user_profiles" alter column "full_name" drop default;

alter table "public"."user_profiles" alter column "full_name" drop not null;

alter table "public"."user_profiles" alter column "updated_at" drop not null;

CREATE INDEX idx_user_profiles_full_name ON public.user_profiles USING btree (full_name);

CREATE UNIQUE INDEX user_profiles_email_key ON public.user_profiles USING btree (email);

CREATE UNIQUE INDEX user_ui_settings_pkey ON public.user_ui_settings USING btree (id);

CREATE UNIQUE INDEX user_ui_settings_user_id_key ON public.user_ui_settings USING btree (user_id);

alter table "public"."user_ui_settings" add constraint "user_ui_settings_pkey" PRIMARY KEY using index "user_ui_settings_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_avatar_url_chk" CHECK (utils.validate_url(avatar_url)) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_avatar_url_chk";

alter table "public"."user_profiles" add constraint "user_profiles_display_name_chk" CHECK (utils.validate_text(display_name, p_max_length => 80)) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_display_name_chk";

alter table "public"."user_profiles" add constraint "user_profiles_email_chk" CHECK (utils.validate_email_format(email)) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_email_chk";

alter table "public"."user_profiles" add constraint "user_profiles_email_key" UNIQUE using index "user_profiles_email_key";

alter table "public"."user_profiles" add constraint "user_profiles_full_name_chk" CHECK (utils.validate_text(full_name, p_max_length => 120)) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_full_name_chk";

alter table "public"."user_ui_settings" add constraint "user_ui_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_ui_settings" validate constraint "user_ui_settings_user_id_fkey";

alter table "public"."user_ui_settings" add constraint "user_ui_settings_user_id_key" UNIQUE using index "user_ui_settings_user_id_key";

set check_function_bodies = off;

create or replace view "public"."client_user_profiles" as  SELECT up.id,
    up.email,
    up.display_name,
    up.full_name,
    up.avatar_url,
    up.is_custom_avatar,
    up.onboarding_completed,
    up.is_deactivated,
    up.last_login_at,
    up.created_at,
    up.updated_at,
    user_ui.preferred_theme,
    user_ui.timezone,
    user_ui.locale
   FROM (public.user_profiles up
     JOIN public.user_ui_settings user_ui ON ((up.id = user_ui.user_id)));


CREATE OR REPLACE FUNCTION public.create_new_user_ui_settings()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.user_ui_settings (user_id)
  VALUES (
    NEW.id -- user_id
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_user_identity_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_avatar_url text;
BEGIN
  -- We only care about providers that usually give avatars
  IF NEW.provider NOT IN ('github', 'google') THEN
    RETURN NEW;
  END IF;

  -- Extract a candidate avatar URL from identity_data
  v_avatar_url := COALESCE(
    NEW.identity_data->>'avatar_url',  -- GitHub often
    NEW.identity_data->>'picture'      -- Google / others
  );

  -- If provider didn't give us anything useful, bail
  IF v_avatar_url IS NULL OR v_avatar_url = '' THEN
    RETURN NEW;
  END IF;

  -- Update user_profiles, but:
  --   - do NOT override custom avatars (is_custom_avatar = TRUE)
  --   - avoid writing if avatar_url is already the same
  UPDATE public.user_profiles
  SET avatar_url = v_avatar_url
  WHERE id = NEW.user_id
    AND is_custom_avatar = FALSE
    AND (avatar_url IS DISTINCT FROM v_avatar_url);

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_null_auth_user_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  IF NEW.email IS NULL AND OLD.email IS NOT NULL THEN
    -- Other option: restore to previous value
    -- NEW.email = OLD.email;

    -- We reject the change outright
    RAISE EXCEPTION 'Email cannot be set to NULL';
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_profile_from_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.user_profiles p
  SET
    -- Keep email in sync with auth.users (in case user changes email)
    -- Only change email if NEW.email is non-null.
    -- If NEW.email is null for some weird reason, keep p.email.
    email = COALESCE(NEW.email, p.email),
    -- No validate; assume auth has checked

    -- Mirror the last_sign_in_at to last_login_at
    last_login_at = COALESCE(NEW.last_sign_in_at, p.last_login_at),

    -- Optionally derive is_deactivated from auth users
    -- These conditions are up to you:
    is_deactivated = (
      -- example: deactivated if deleted or banned
      (NEW.deleted_at IS NOT NULL) OR
      (NEW.banned_until IS NOT NULL AND NEW.banned_until > NOW())
    )
  WHERE p.id = NEW.id;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_email text;
  v_display_name text;
  v_full_name    text;
  v_avatar_url   text;
BEGIN
  -- Derive & normalize email
  v_email := COALESCE(
    NEW.email,
    NEW.raw_user_meta_data->>'email'
  );

  -- Normalize, then validate email format
  v_email := LOWER(TRIM(v_email));

  IF NOT utils.validate_email_format(v_email) THEN
    RAISE EXCEPTION 'Invalid email format: %', v_email;
  END IF;

  -- Derive display_name
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name', -- Supabase default
    NEW.raw_user_meta_data->>'preferred_username', -- GitHub provided default
    NEW.raw_user_meta_data->>'user_name', -- GitHub default
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.email
  );

  -- Derive full_name
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    v_display_name,
    NEW.email
  );

  -- Derive avatar_url (provider default)
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url', -- GitHub
    NEW.raw_user_meta_data->>'picture'     -- Google / others
  );

  IF NOT utils.validate_url(v_avatar_url) THEN
    RAISE EXCEPTION 'Invalid avatar URL: %', v_avatar_url;
  END IF;

  INSERT INTO public.user_profiles (
    id,
    email,
    display_name,
    full_name,
    avatar_url
    -- everything else uses table defaults:
    -- role                    -> 'user'
    -- is_custom_avatar        -> false
    -- preferred_theme         -> 'system'
    -- is_deactivated          -> false
    -- onboarding_completed    -> false
    -- last_login_at           -> now()
    -- created_at/updated_at   -> now()
  )
  VALUES (
    NEW.id,
    v_email,
    v_display_name,
    v_full_name,
    v_avatar_url
  );

  RETURN NULL; -- AFTER trigger: return value ignored
END;
$function$
;

grant delete on table "public"."user_ui_settings" to "anon";

grant insert on table "public"."user_ui_settings" to "anon";

grant references on table "public"."user_ui_settings" to "anon";

grant select on table "public"."user_ui_settings" to "anon";

grant trigger on table "public"."user_ui_settings" to "anon";

grant truncate on table "public"."user_ui_settings" to "anon";

grant update on table "public"."user_ui_settings" to "anon";

grant delete on table "public"."user_ui_settings" to "authenticated";

grant insert on table "public"."user_ui_settings" to "authenticated";

grant references on table "public"."user_ui_settings" to "authenticated";

grant select on table "public"."user_ui_settings" to "authenticated";

grant trigger on table "public"."user_ui_settings" to "authenticated";

grant truncate on table "public"."user_ui_settings" to "authenticated";

grant update on table "public"."user_ui_settings" to "authenticated";

grant delete on table "public"."user_ui_settings" to "service_role";

grant insert on table "public"."user_ui_settings" to "service_role";

grant references on table "public"."user_ui_settings" to "service_role";

grant select on table "public"."user_ui_settings" to "service_role";

grant trigger on table "public"."user_ui_settings" to "service_role";

grant truncate on table "public"."user_ui_settings" to "service_role";

grant update on table "public"."user_ui_settings" to "service_role";


  create policy "Users CANNOT create their own profiles"
  on "public"."user_profiles"
  as permissive
  for insert
  to authenticated
with check (false);



  create policy "Users CANNOT delete their own profiles"
  on "public"."user_profiles"
  as permissive
  for delete
  to authenticated
using (false);



  create policy "Users can update their own profiles"
  on "public"."user_profiles"
  as permissive
  for update
  to authenticated
using ((id = ( SELECT auth.uid() AS uid)))
with check ((id = ( SELECT auth.uid() AS uid)));



  create policy "Users can view their own profiles"
  on "public"."user_profiles"
  as permissive
  for select
  to authenticated
using ((id = ( SELECT auth.uid() AS uid)));



  create policy "Users CANNOT create their own UI settings"
  on "public"."user_ui_settings"
  as permissive
  for insert
  to authenticated
with check (false);



  create policy "Users CANNOT delete their own UI settings"
  on "public"."user_ui_settings"
  as permissive
  for delete
  to authenticated
using (false);



  create policy "Users can update their own UI settings"
  on "public"."user_ui_settings"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can view their own UI settings"
  on "public"."user_ui_settings"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));


CREATE TRIGGER handle_updated_at_user_profiles BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('updated_at');

CREATE TRIGGER on_user_profile_created AFTER INSERT ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.create_new_user_ui_settings();

CREATE TRIGGER handle_updated_at_user_ui_settings BEFORE UPDATE ON public.user_ui_settings FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('updated_at');

CREATE TRIGGER on_user_identity_change AFTER INSERT OR UPDATE ON auth.identities FOR EACH ROW EXECUTE FUNCTION public.handle_user_identity_change();

CREATE TRIGGER on_auth_user_updated AFTER UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.sync_profile_from_auth_user();

CREATE TRIGGER prevent_null_auth_user_email BEFORE UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.prevent_null_auth_user_email();


