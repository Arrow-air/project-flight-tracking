# Feature: Total Flight Time Per Aircraft

## Goal
Display cumulative total flight time for each aircraft (drone), derived from the autopilot's `STAT_FLTTIME` counter extracted from uploaded DataFlash `.bin` logs. Also display fleet-wide total flight hours across all aircraft.

## Design Rationale
Not every flight log gets uploaded, so summing individual leg durations would undercount. Instead, we use the autopilot's own cumulative `STAT_FLTTIME` parameter, which tracks total flight time across the aircraft's entire lifetime. The **highest** `estimatedTotalFlightMinutesAfter` value across all logs for an aircraft represents the most up-to-date truth.

We also store per-leg flight duration (`totalFlightSeconds`) for display on individual flight records.

## Branch
`feature/aircraft-flight-time`

---

## Changes

### 1. Database Migration

**New file:** `supabase/migrations/20260407231200_add_flight_time_columns.sql`

```sql
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
```

### 2. Edge Function: Write flight time back on analysis

**File:** `supabase/functions/mavlink-parser/index.ts`

Modify the `handleLogTimeAnalysis` route (`POST /logs/:flightLegId/time/analysis`):

- After running `getLogTimeAnalysis()`, take the **last** (most recent) result's `estimatedTotalFlightMinutesAfter` and `totalFlightSeconds`
- Write these back to the `flight_legs` row:
  ```ts
  await supabaseAdmin
    .from('flight_legs')
    .update({
      flight_duration_sec: lastResult.totalFlightSeconds,
      cumulative_flight_minutes: lastResult.estimatedTotalFlightMinutesAfter,
    })
    .eq('id', flightLegId);
  ```
- Import `supabaseAdmin` from `../_shared/supabaseAdmin.ts` (already exists)
- Only update if values are non-null (don't overwrite with undefined)
- Continue returning the existing JSON response (non-breaking)

### 3. Frontend API: Aircraft flight totals

**New file:** `frontend/src/api/rest/aircraft_flight_totals.api.ts`

```ts
// Query the aircraft_flight_totals view
export interface AircraftFlightTotal {
  aircraftId: string;
  totalFlightMinutes: number | null;
  totalFlightLegs: number;
}

export async function getAircraftFlightTotals(): Promise<AircraftFlightTotal[]> {
  // SELECT * FROM aircraft_flight_totals
  const { data, error } = await supabase
    .from('aircraft_flight_totals')
    .select('*');
  // Map snake_case → camelCase
}

export async function getAircraftFlightTotal(aircraftId: string): Promise<AircraftFlightTotal | null> {
  const { data, error } = await supabase
    .from('aircraft_flight_totals')
    .select('*')
    .eq('aircraft_id', aircraftId)
    .maybeSingle();
}
```

### 4. Frontend API: Fleet flight totals

**New file:** `frontend/src/api/rest/fleet_flight_totals.api.ts`

```ts
export interface FleetFlightTotal {
  totalFlightMinutes: number | null;
  aircraftWithLogs: number;
  totalAircraft: number;
  totalFlightLegs: number;
}

export async function getFleetFlightTotals(): Promise<FleetFlightTotal | null> {
  const { data, error } = await supabase
    .from('fleet_flight_totals')
    .select('*')
    .single();
}
```

### 5. Frontend: Aircraft List Page

**File:** `frontend/src/views/aircraft/ListAircraftPage.vue`

- On mount, also call `getAircraftFlightTotals()` to get a map of `aircraftId → totalMinutes`
- Pass the flight time to each `AircraftCard`
- Also fetch `getFleetFlightTotals()` on mount
- Display a **fleet total banner/stat** at the top of the page: "Total Quiver Flight Time: XXh XXm across N aircraft"

**File:** `frontend/src/components/aircraft/AircraftCard.vue`

- Add optional `totalFlightMinutes` prop
- Display formatted flight time (e.g. "12h 34m" or "—" if null) in the card body
- Helper: `formatFlightTime(minutes: number | null): string`

### 6. Frontend: Aircraft Detail Page

**File:** `frontend/src/views/aircraft/AircraftPage.vue`

- Fetch `getAircraftFlightTotal(aircraftId)` on mount
- Display total flight time in the Details card (new row in the grid, alongside Name/Type/Serial/Owner)
- Display total number of flight legs

### 7. Frontend: Flight Leg Details

**File:** `frontend/src/components/flight_legs/FlightLegDetailsSection.vue`

- If `flight_duration_sec` is present on the leg data, show "Flight duration: Xm Ys" in the details grid
- Requires adding `flightDurationSec` and `cumulativeFlightMinutes` to `FlightLegRow` / `FlightLegData` interfaces in `flight_legs.api.ts`

### 8. Frontend: Flight Leg Card

**File:** `frontend/src/components/flight_legs/FlightLegCard.vue`

- Show flight duration badge if available

---

## File Summary

| File | Action |
|------|--------|
| `supabase/migrations/20260407231200_add_flight_time_columns.sql` | **CREATE** — migration |
| `supabase/functions/mavlink-parser/index.ts` | **MODIFY** — write flight time to DB after analysis |
| `frontend/src/api/rest/aircraft_flight_totals.api.ts` | **CREATE** — new API module |
| `frontend/src/api/rest/fleet_flight_totals.api.ts` | **CREATE** — new API module |
| `frontend/src/api/rest/flight_legs.api.ts` | **MODIFY** — add new fields to interfaces + mapper |
| `frontend/src/components/aircraft/AircraftCard.vue` | **MODIFY** — show flight time |
| `frontend/src/views/aircraft/AircraftPage.vue` | **MODIFY** — fetch + show flight time |
| `frontend/src/views/aircraft/ListAircraftPage.vue` | **MODIFY** — fetch totals, pass to cards |
| `frontend/src/components/flight_legs/FlightLegDetailsSection.vue` | **MODIFY** — show per-leg duration |
| `frontend/src/components/flight_legs/FlightLegCard.vue` | **MODIFY** — show duration badge |

10 files total — 3 new, 7 modified.

## Notes

- The `aircraft_flight_totals` view uses RLS passthrough (views inherit the calling user's RLS context), so the broad SELECT policies already in place will work
- If `STAT_FLTTIME` is not present in a log (older firmware), `estimatedTotalFlightMinutesAfter` will be null — that's fine, we just won't update
- The edge function uses `supabaseAdmin` (service role) so the UPDATE bypasses RLS — this is intentional since it's server-side
- The `fleet_flight_totals` view sums the per-aircraft MAX values (not individual legs) to avoid double-counting
