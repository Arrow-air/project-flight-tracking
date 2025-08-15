-- Users Schema
-- Application users with roles and authentication

-- =========================================================================
-- TYPE DEFINITIONS
-- =========================================================================
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM (
    'user', 
    'admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =========================================================================
-- TABLE: public.user_profiles (extends Supabase auth.users)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role public.user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- INDEXES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Optional: enable fast name search using trigram (requires pg_trgm)
CREATE INDEX IF NOT EXISTS idx_user_profiles_full_name_trgm ON public.user_profiles USING gin (full_name gin_trgm_ops);

-- =========================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

-- =========================================================================
-- TRIGGERS
-- =========================================================================

-- Add trigger to automatically update date_updated on user_profiles table
CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime('updated_at');

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- ROW LEVEL SECURITY POLICIES
-- =========================================================================

-- Policy: Allow all authenticated users to view user profiles
CREATE POLICY user_profiles_select 
  ON public.user_profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can view own profile" ON public.user_profiles 
FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles 
FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY user_profiles_insert_own
  ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- =========================================================================
-- GRANTS
-- =========================================================================
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
