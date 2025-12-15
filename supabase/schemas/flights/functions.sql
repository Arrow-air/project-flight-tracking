
-- Flight Legs Functions
-- =============================================================
CREATE TRIGGER set_updated_at_flight_run
  BEFORE UPDATE ON public.flight_legs
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime('updated_at');


-- Flight Notes Functions
-- =============================================================
CREATE TRIGGER set_updated_at_flight_notes
  BEFORE UPDATE ON public.flight_notes
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime('updated_at');


-- Flight Leg Logs Functions
-- =============================================================
CREATE TRIGGER set_updated_at_flight_leg_logs
  BEFORE UPDATE ON public.flight_leg_logs
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime('updated_at');


-- Flight Leg Tags Functions
-- =============================================================
CREATE TRIGGER set_updated_at_flight_leg_tags
  BEFORE UPDATE ON public.flight_leg_tags
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime('updated_at');

