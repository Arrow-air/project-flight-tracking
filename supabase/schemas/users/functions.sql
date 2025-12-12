
-- ========================================
-- [ user_profiles ] Table Triggers and Functions
-- ========================================

-- Trigger to update updated_at timestamp
CREATE TRIGGER handle_updated_at_user_profiles
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Function to handle user creation
-- Actually need to use security definer to access auth data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();



-- Handle identity changes (e.g. avatar url changes), when new identities linked/updated
CREATE OR REPLACE FUNCTION public.handle_user_identity_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

CREATE TRIGGER on_user_identity_change
    AFTER INSERT OR UPDATE ON auth.identities
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_user_identity_change();


-- Sync user profile from auth.users
CREATE OR REPLACE FUNCTION public.sync_profile_from_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_profile_from_auth_user();


-- Prevent auth users from setting their email to NULL
CREATE OR REPLACE FUNCTION public.prevent_null_auth_user_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.email IS NULL AND OLD.email IS NOT NULL THEN
    -- Other option: restore to previous value
    -- NEW.email = OLD.email;

    -- We reject the change outright
    RAISE EXCEPTION 'Email cannot be set to NULL';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_null_auth_user_email
    BEFORE UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_null_auth_user_email();



-- ========================================================
-- [ user_ui_settings ] Table Triggers and Functions
-- ========================================================

-- Trigger to update updated_at timestamp
CREATE TRIGGER handle_updated_at_user_ui_settings
    BEFORE UPDATE ON user_ui_settings
    FOR EACH ROW
    EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Function to handle user UI settings creation
CREATE OR REPLACE FUNCTION public.create_new_user_ui_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_ui_settings (user_id)
  VALUES (
    NEW.id -- user_id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_profile_created
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.create_new_user_ui_settings();
