

CREATE TABLE public.flight_leg_logs (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  -- Relationships
  flight_leg_id uuid REFERENCES public.flight_legs(id) ON DELETE CASCADE,
  uploaded_by_id uuid REFERENCES public.user_profiles(id),

  -- Data
  title text NOT NULL,
  notes text,
  size_bytes bigint,
  bucket text NOT NULL DEFAULT 'flight-logs',
  object_path text NOT NULL,
  content_type text,
  checksum_sha256 text
);

ALTER TABLE public.flight_leg_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flight leg logs" ON public.flight_leg_logs 
FOR SELECT TO authenticated USING ((SELECT auth.uid()) = uploaded_by_id);

CREATE POLICY "Users can create flight leg logs" ON public.flight_leg_logs 
FOR INSERT TO authenticated 
WITH CHECK ((SELECT auth.uid()) = uploaded_by_id);

CREATE POLICY "Users can update own flight leg logs" ON public.flight_leg_logs 
FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = uploaded_by_id)
WITH CHECK ((SELECT auth.uid()) = uploaded_by_id);


CREATE TRIGGER set_updated_at_flight_leg_logs
  BEFORE UPDATE ON public.flight_leg_logs
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime('updated_at');