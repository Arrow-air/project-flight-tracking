
-- Create aircraft table
CREATE TABLE public.aircraft (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Relationships
  owner_id uuid REFERENCES public.user_profiles(id),
  
  -- Data
  name text,
  aircraft_type text,
  notes text,
  serial_number text NOT NULL UNIQUE
);

-- Enable RLS
ALTER TABLE public.aircraft ENABLE ROW LEVEL SECURITY;

-- Policies for aircraft
CREATE POLICY "Users can view own aircraft" ON public.aircraft 
FOR SELECT TO authenticated USING ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Authenticated users can create aircraft" ON public.aircraft 
FOR INSERT TO authenticated 
WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can update own aircraft" ON public.aircraft 
FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = owner_id)
WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE TRIGGER set_updated_at_aircraft
  BEFORE UPDATE ON public.aircraft
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime('updated_at');