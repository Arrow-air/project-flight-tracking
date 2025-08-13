

CREATE TABLE public.flight_leg_tags (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  -- Relationships
  leg_id uuid NOT NULL REFERENCES public.flight_legs(id),
  tag_id uuid NOT NULL REFERENCES public.tags(id),
  tagged_by_id uuid REFERENCES public.user_profiles(id),

  -- Data
  CONSTRAINT flight_leg_tags_unique UNIQUE (tag_id, leg_id)
);

ALTER TABLE public.flight_leg_tags ENABLE ROW LEVEL SECURITY;

-- Policies for flight_leg_tags
CREATE POLICY "Users can view own flight leg tags" ON public.flight_leg_tags 
FOR SELECT TO authenticated USING ((SELECT auth.uid()) = tagged_by_id);

CREATE POLICY "Users can create flight leg tags" ON public.flight_leg_tags 
FOR INSERT TO authenticated 
WITH CHECK ((SELECT auth.uid()) = tagged_by_id);

CREATE POLICY "Users can update own flight leg tags" ON public.flight_leg_tags 
FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = tagged_by_id)
WITH CHECK ((SELECT auth.uid()) = tagged_by_id);


CREATE TRIGGER set_updated_at_flight_leg_tags
  BEFORE UPDATE ON public.flight_leg_tags
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime('updated_at');


CREATE VIEW public.flight_leg_tags_with_tags AS
SELECT 
  flight_leg_tags.*,
  tags.name AS tag_name,
  tags.description AS tag_description
FROM public.flight_leg_tags
JOIN public.tags ON flight_leg_tags.tag_id = tags.id;
