-- Core Schema
-- Extensions, types, and foundational entities

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE SCHEMA IF NOT EXISTS gis;

ALTER DATABASE postgres SET search_path TO public, extensions, gis;

-- Extensions
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions; -- UUIDs
CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA extensions; -- GraphQL API support
CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions; -- automatic timestamp updates
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions; -- trigram index support (name search)
CREATE EXTENSION IF NOT EXISTS pg_hashids WITH SCHEMA extensions; -- URL-friendly encoding, short UIDs

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA gis; -- spatial data (dedicated schema for better version management)

-- GIS Schema Permissions
-- ------------------------------------------------------------
-- Grant usage permissions on gis schema to authenticated users
GRANT USAGE ON SCHEMA gis TO authenticated;
GRANT USAGE ON SCHEMA gis TO service_role;
-- GRANT USAGE ON SCHEMA gis TO anon;

-- Grant execute permissions on all functions in gis schema
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA gis TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA gis TO service_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA gis TO anon;

-- Grant future function permissions 
ALTER DEFAULT PRIVILEGES IN SCHEMA gis GRANT EXECUTE ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA gis GRANT EXECUTE ON FUNCTIONS TO service_role;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA gis GRANT EXECUTE ON FUNCTIONS TO anon;

