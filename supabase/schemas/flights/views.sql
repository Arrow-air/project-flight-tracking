
-- Flight Leg Tags View
-- =============================================================
CREATE VIEW public.flight_leg_tags_with_tags AS
SELECT
  flight_leg_tags.*,
  tags.name AS tag_name,
  tags.description AS tag_description
FROM public.flight_leg_tags
JOIN public.tags ON flight_leg_tags.tag_id = tags.id;

