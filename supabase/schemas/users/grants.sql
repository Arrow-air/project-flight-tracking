-- Tables
-- ========================================
-- [user_profiles]
-- Remove direct access to the base table from anon/authenticated
-- Instead, use the views and functions to access the data
REVOKE ALL ON public.user_profiles FROM PUBLIC;
REVOKE ALL ON public.user_profiles FROM anon;
REVOKE ALL ON public.user_profiles FROM authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;


-- Views
-- ========================================
-- [client_user_profiles]
-- Defensive: revoke all access to the view from all roles
REVOKE ALL ON public.client_user_profiles FROM PUBLIC;
REVOKE ALL ON public.client_user_profiles FROM anon;
REVOKE ALL ON public.client_user_profiles FROM authenticated;

-- Grant access to the view only to authenticated users
-- (Probably no INSERT from the client; creation happens via trigger)
GRANT SELECT, UPDATE ON public.client_user_profiles TO authenticated;


-- Functions
-- ========================================
