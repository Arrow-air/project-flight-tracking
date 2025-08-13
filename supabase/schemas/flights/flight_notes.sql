-- Create enum type for note types
CREATE TYPE public.flight_note_type AS ENUM (
    'pilot',
    'admin',
    'engineer',
    'witness',
    'other'
);

CREATE TABLE public.flight_notes (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  -- Relationships
  author_id uuid REFERENCES public.user_profiles(id),
  flight_leg_id uuid REFERENCES public.flight_legs(id),

  -- Data
  notes text,
  note_type public.flight_note_type NOT NULL
);

-- Enable RLS
ALTER TABLE public.flight_notes ENABLE ROW LEVEL SECURITY;

-- Policies for flight_notes
CREATE POLICY "Users can view own flight notes" ON public.flight_notes 
FOR SELECT TO authenticated USING ((SELECT auth.uid()) = author_id);

CREATE POLICY "Users can create flight notes" ON public.flight_notes 
FOR INSERT TO authenticated 
WITH CHECK ((SELECT auth.uid()) = author_id);

CREATE POLICY "Users can update own flight notes" ON public.flight_notes 
FOR UPDATE USING ((SELECT auth.uid()) = author_id)
WITH CHECK ((SELECT auth.uid()) = author_id);


CREATE TRIGGER set_updated_at_flight_notes
  BEFORE UPDATE ON public.flight_notes
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime('updated_at');