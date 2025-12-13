-- Updatable view for client-side use
-- We specifically exclude some fields that we do NOT want to expose to the client
-- This is to prevent accidental exposure of sensitive data:
-- - role
-- - stripe_sandbox_customer_id

CREATE VIEW client_user_profiles
    WITH (security_invoker = on)
    AS
    SELECT 
        up.id,

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
    FROM public.user_profiles up
    INNER JOIN public.user_ui_settings user_ui ON up.id = user_ui.user_id;

-- [!!!] Does not get picked up by diff tool.
-- Must be set manually in migration files it seems.
alter view public.client_user_profiles
  set (security_invoker = on);
