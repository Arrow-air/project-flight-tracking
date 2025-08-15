

-- Create aircraft_hardware table
CREATE TABLE public.aircraft_hardware (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  -- Relationships
  aircraft_id uuid NOT NULL REFERENCES public.aircraft(id) ON DELETE CASCADE,
  
  -- Data
  json jsonb
);

-- Enable RLS
ALTER TABLE public.aircraft_hardware ENABLE ROW LEVEL SECURITY;

-- Policies for aircraft_hardware
CREATE POLICY "Users can view hardware for own aircraft" ON public.aircraft_hardware 
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.aircraft 
    WHERE id = aircraft_hardware.aircraft_id 
    AND owner_id = (SELECT auth.uid())
  )
);

CREATE TRIGGER set_updated_at_aircraft_hardware
  BEFORE UPDATE ON public.aircraft_hardware
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime('updated_at');