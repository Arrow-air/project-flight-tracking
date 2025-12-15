
-- Create enum type for note types
CREATE TYPE public.flight_note_type AS ENUM (
    'pilot',
    'admin',
    'engineer',
    'witness',
    'other'
);
