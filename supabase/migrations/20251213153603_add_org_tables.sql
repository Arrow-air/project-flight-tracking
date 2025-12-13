create type "public"."organization_member_role" as enum ('owner', 'admin', 'member');

drop view if exists "public"."client_user_profiles";


  create table "public"."organization_members" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "role" public.organization_member_role not null default 'member'::public.organization_member_role,
    "organization_id" uuid,
    "user_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."organization_members" enable row level security;


  create table "public"."organizations" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" character varying not null,
    "description" character varying,
    "website_url" character varying,
    "email" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."organizations" enable row level security;

CREATE INDEX idx_organization_members_organization_id ON public.organization_members USING btree (organization_id);

CREATE INDEX idx_organization_members_user_id ON public.organization_members USING btree (user_id);

CREATE INDEX idx_organizations_name ON public.organizations USING btree (name);

CREATE UNIQUE INDEX organization_members_organization_id_user_id_key ON public.organization_members USING btree (organization_id, user_id);

CREATE UNIQUE INDEX organization_members_pkey ON public.organization_members USING btree (id);

CREATE UNIQUE INDEX organizations_name_key ON public.organizations USING btree (name);

CREATE UNIQUE INDEX organizations_pkey ON public.organizations USING btree (id);

alter table "public"."organization_members" add constraint "organization_members_pkey" PRIMARY KEY using index "organization_members_pkey";

alter table "public"."organizations" add constraint "organizations_pkey" PRIMARY KEY using index "organizations_pkey";

alter table "public"."organization_members" add constraint "organization_members_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."organization_members" validate constraint "organization_members_organization_id_fkey";

alter table "public"."organization_members" add constraint "organization_members_organization_id_user_id_key" UNIQUE using index "organization_members_organization_id_user_id_key";

alter table "public"."organization_members" add constraint "organization_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."organization_members" validate constraint "organization_members_user_id_fkey";

alter table "public"."organizations" add constraint "organizations_email_chk" CHECK (utils.validate_email_format(email)) not valid;

alter table "public"."organizations" validate constraint "organizations_email_chk";

alter table "public"."organizations" add constraint "organizations_name_key" UNIQUE using index "organizations_name_key";

alter table "public"."organizations" add constraint "organizations_website_url_chk" CHECK (utils.validate_url((website_url)::text)) not valid;

alter table "public"."organizations" validate constraint "organizations_website_url_chk";

set check_function_bodies = off;

create or replace view "public"."client_organization_members" as  SELECT om.id,
    om.organization_id,
    om.role,
    om.created_at AS member_since,
    om.updated_at AS member_updated_at,
    up.email,
    up.full_name,
    up.display_name,
    up.avatar_url,
    up.last_login_at AS last_seen_at,
    user_ui.timezone,
    user_ui.locale,
    org.name AS organization_name
   FROM (((public.organization_members om
     JOIN public.organizations org ON ((om.organization_id = org.id)))
     JOIN public.user_profiles up ON ((om.user_id = up.id)))
     JOIN public.user_ui_settings user_ui ON ((up.id = user_ui.user_id)))
  WHERE (om.organization_id IN ( SELECT organization_members.organization_id
           FROM public.organization_members
          WHERE (organization_members.user_id = auth.uid())));


create or replace view "public"."client_user_organizations" as  SELECT org.id,
    org.name,
    org.description,
    org.website_url,
    org.email,
    org.created_at,
    org.updated_at,
    om.role AS member_role,
    om.user_id,
    om.created_at AS member_since,
    om.updated_at AS membership_updated_at
   FROM (public.organizations org
     JOIN public.organization_members om ON ((org.id = om.organization_id)))
  WHERE (om.user_id = auth.uid());


CREATE OR REPLACE FUNCTION public.prevent_losing_last_org_owner()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  remaining_owners integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Deleting a row
    IF OLD.role = 'owner' THEN
      SELECT count(*) INTO remaining_owners
      FROM organization_members
      WHERE organization_id = OLD.organization_id
        AND role = 'owner'
        AND user_id <> OLD.user_id;

      IF remaining_owners = 0 THEN
        RAISE EXCEPTION
          'Organization % must have at least one owner',
          OLD.organization_id;
      END IF;
    END IF;

    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Updating a row: check if we are demoting an owner
    IF OLD.role = 'owner' AND NEW.role <> 'owner' THEN
      SELECT count(*) INTO remaining_owners
      FROM organization_members
      WHERE organization_id = OLD.organization_id
        AND role = 'owner'
        AND user_id <> OLD.user_id;

      IF remaining_owners = 0 THEN
        RAISE EXCEPTION
          'Organization % must have at least one owner',
          NEW.organization_id;
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL; -- should never reach here
END;
$function$
;

CREATE OR REPLACE FUNCTION public.user_is_org_admin(p_organization_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_id = p_organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    );
$function$
;

CREATE OR REPLACE FUNCTION public.user_is_org_member(p_organization_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_id = p_organization_id
        AND user_id = auth.uid()
    );
$function$
;

CREATE OR REPLACE FUNCTION public.user_is_org_owner(p_organization_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_id = p_organization_id
        AND user_id = auth.uid()
        AND role = 'owner'
    );
$function$
;

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


grant delete on table "public"."organization_members" to "anon";

grant insert on table "public"."organization_members" to "anon";

grant references on table "public"."organization_members" to "anon";

grant select on table "public"."organization_members" to "anon";

grant trigger on table "public"."organization_members" to "anon";

grant truncate on table "public"."organization_members" to "anon";

grant update on table "public"."organization_members" to "anon";

grant delete on table "public"."organization_members" to "authenticated";

grant insert on table "public"."organization_members" to "authenticated";

grant references on table "public"."organization_members" to "authenticated";

grant select on table "public"."organization_members" to "authenticated";

grant trigger on table "public"."organization_members" to "authenticated";

grant truncate on table "public"."organization_members" to "authenticated";

grant update on table "public"."organization_members" to "authenticated";

grant delete on table "public"."organization_members" to "service_role";

grant insert on table "public"."organization_members" to "service_role";

grant references on table "public"."organization_members" to "service_role";

grant select on table "public"."organization_members" to "service_role";

grant trigger on table "public"."organization_members" to "service_role";

grant truncate on table "public"."organization_members" to "service_role";

grant update on table "public"."organization_members" to "service_role";

grant delete on table "public"."organizations" to "anon";

grant insert on table "public"."organizations" to "anon";

grant references on table "public"."organizations" to "anon";

grant select on table "public"."organizations" to "anon";

grant trigger on table "public"."organizations" to "anon";

grant truncate on table "public"."organizations" to "anon";

grant update on table "public"."organizations" to "anon";

grant delete on table "public"."organizations" to "authenticated";

grant insert on table "public"."organizations" to "authenticated";

grant references on table "public"."organizations" to "authenticated";

grant select on table "public"."organizations" to "authenticated";

grant trigger on table "public"."organizations" to "authenticated";

grant truncate on table "public"."organizations" to "authenticated";

grant update on table "public"."organizations" to "authenticated";

grant delete on table "public"."organizations" to "service_role";

grant insert on table "public"."organizations" to "service_role";

grant references on table "public"."organizations" to "service_role";

grant select on table "public"."organizations" to "service_role";

grant trigger on table "public"."organizations" to "service_role";

grant truncate on table "public"."organizations" to "service_role";

grant update on table "public"."organizations" to "service_role";


  create policy "Admins can add members to their organization"
  on "public"."organization_members"
  as permissive
  for insert
  to authenticated
with check ((public.user_is_org_admin(organization_id) AND ((role <> 'owner'::public.organization_member_role) OR public.user_is_org_owner(organization_id))));



  create policy "Admins can remove members from their organization"
  on "public"."organization_members"
  as permissive
  for delete
  to authenticated
using ((public.user_is_org_admin(organization_id) AND ((role <> 'owner'::public.organization_member_role) OR public.user_is_org_owner(organization_id)) AND ((role <> 'admin'::public.organization_member_role) OR public.user_is_org_owner(organization_id))));



  create policy "Admins can update members in their organization"
  on "public"."organization_members"
  as permissive
  for update
  to authenticated
using ((public.user_is_org_admin(organization_id) AND ((role <> 'owner'::public.organization_member_role) OR public.user_is_org_owner(organization_id))))
with check (((role <> 'owner'::public.organization_member_role) OR public.user_is_org_owner(organization_id)));



  create policy "Members can view their organization's members"
  on "public"."organization_members"
  as permissive
  for select
  to authenticated
using (public.user_is_org_member(organization_id));



  create policy "Users can leave an organization"
  on "public"."organization_members"
  as permissive
  for delete
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Admins can update their own organizations"
  on "public"."organizations"
  as permissive
  for update
  to authenticated
using (public.user_is_org_admin(id));



  create policy "Authenticated users can create organizations"
  on "public"."organizations"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.role() AS role) = 'authenticated'::text));



  create policy "Owners can delete their own organizations"
  on "public"."organizations"
  as permissive
  for delete
  to authenticated
using (public.user_is_org_owner(id));



  create policy "Users can view their own organizations"
  on "public"."organizations"
  as permissive
  for select
  to authenticated
using (public.user_is_org_member(id));


CREATE TRIGGER handle_prevent_losing_last_org_owner BEFORE DELETE OR UPDATE ON public.organization_members FOR EACH ROW EXECUTE FUNCTION public.prevent_losing_last_org_owner();

CREATE TRIGGER handle_updated_at_organization_members BEFORE UPDATE ON public.organization_members FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('updated_at');

CREATE TRIGGER handle_updated_at_organizations BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('updated_at');


