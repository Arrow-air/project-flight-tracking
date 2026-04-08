-- Per-leg: flight duration from this specific log (measured arm-to-disarm)
ALTER TABLE public.flight_legs
  ADD COLUMN flight_duration_sec double precision;

-- Per-leg: cumulative total flight time reported by autopilot after this flight
-- This is estimatedTotalFlightMinutesAfter from the parser (STAT_FLTTIME + this leg's duration)
ALTER TABLE public.flight_legs
  ADD COLUMN cumulative_flight_minutes double precision;

-- View: get the max cumulative flight time per aircraft
CREATE OR REPLACE VIEW public.aircraft_flight_totals AS
SELECT
  fl.aircraft_id,
  MAX(fl.cumulative_flight_minutes) AS total_flight_minutes,
  COUNT(fl.id) AS total_flight_legs
FROM public.flight_legs fl
WHERE fl.cumulative_flight_minutes IS NOT NULL
GROUP BY fl.aircraft_id;

-- View: total flight hours across ALL aircraft (fleet-wide)
CREATE OR REPLACE VIEW public.fleet_flight_totals AS
SELECT
  COALESCE(SUM(aft.total_flight_minutes), 0) AS total_flight_minutes,
  COUNT(aft.aircraft_id) AS aircraft_with_logs,
  (SELECT COUNT(*) FROM public.aircraft) AS total_aircraft,
  (SELECT COUNT(*) FROM public.flight_legs) AS total_flight_legs
FROM public.aircraft_flight_totals aft;
