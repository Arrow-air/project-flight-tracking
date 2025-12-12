
-- Utils Schema Setup
-- ------------------------------------------------------------
-- Create the utils schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS utils;

-- Grant USAGE on the utils schema to authenticated users and service_role
-- This allows them to call functions in the schema
GRANT USAGE ON SCHEMA utils TO authenticated;
GRANT USAGE ON SCHEMA utils TO anon;
GRANT USAGE ON SCHEMA utils TO service_role;

-- Grant EXECUTE on all functions in the utils schema
-- This is done after function creation below
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA utils TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA utils TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA utils TO service_role;

-- Grant future function permissions 
ALTER DEFAULT PRIVILEGES IN SCHEMA utils GRANT EXECUTE ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA utils GRANT EXECUTE ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA utils GRANT EXECUTE ON FUNCTIONS TO service_role;
