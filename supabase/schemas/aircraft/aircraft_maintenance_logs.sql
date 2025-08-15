-- Create enum type for log types
CREATE TYPE public.maintenance_log_type AS ENUM (
    'build',
    'maintenance', 
    'upgrade', 
    'repair',
    'trouble-shooting',
    'ground-run', 
    'other'
);

-- Create aircraft_maintenance_log table
CREATE TABLE public.aircraft_maintenance_log (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  -- Relationships
  author_id uuid REFERENCES public.user_profiles(id),
  aircraft_id uuid REFERENCES public.aircraft(id) ON DELETE CASCADE,

  -- Data
  log_type public.maintenance_log_type NOT NULL,
  notes text
);

-- Enable RLS
ALTER TABLE public.aircraft_maintenance_log ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER set_updated_at_aircraft_maintenance_logs
  BEFORE UPDATE ON public.aircraft_maintenance_log 
  FOR EACH ROW 
  EXECUTE FUNCTION extensions.moddatetime('updated_at');


-- Policies for aircraft_maintenance_log
CREATE POLICY "Users can view maintenance logs for own aircraft" ON public.aircraft_maintenance_log 
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.aircraft 
    WHERE id = aircraft_maintenance_log.aircraft_id 
    AND owner_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can create maintenance logs" ON public.aircraft_maintenance_log 
FOR INSERT TO authenticated 
WITH CHECK ((SELECT auth.uid()) = author_id);
