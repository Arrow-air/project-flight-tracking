

-- Create flight_run table
CREATE TABLE public.flight_legs (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  -- Relationships
  pilot_id uuid NOT NULL REFERENCES public.user_profiles(id),
  aircraft_id uuid NOT NULL REFERENCES public.aircraft(id),

  -- Data
  location text,
  altitude_m integer,
  temp_C smallint,
  title text,
  description text
);

-- Enable RLS
ALTER TABLE public.flight_legs ENABLE ROW LEVEL SECURITY;

-- Policies for flight_run
CREATE POLICY "Users can view own flight runs" ON public.flight_legs 
FOR SELECT TO authenticated USING ((SELECT auth.uid()) = pilot_id);

CREATE POLICY "Users can create flight runs" ON public.flight_legs 
FOR INSERT TO authenticated 
WITH CHECK ((SELECT auth.uid()) = pilot_id);

CREATE POLICY "Users can update own flight runs" ON public.flight_legs 
FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = pilot_id)
WITH CHECK ((SELECT auth.uid()) = pilot_id);

CREATE TRIGGER set_updated_at_flight_run
  BEFORE UPDATE ON public.flight_legs
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime('updated_at');