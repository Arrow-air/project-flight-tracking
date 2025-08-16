-- Broad SELECT/UPDATE policies for aircraft and flights schemas
-- WARNING: This grants any authenticated user read and update access to these tables.
-- Ensure this is desired for your environment.

-- Aircraft
drop policy if exists "All authenticated can view aircraft" on public.aircraft;
create policy "All authenticated can view aircraft" on public.aircraft
for select to authenticated using (true);

drop policy if exists "All authenticated can update aircraft" on public.aircraft;
create policy "All authenticated can update aircraft" on public.aircraft
for update to authenticated using (true) with check (true);

-- Aircraft hardware
drop policy if exists "All authenticated can view aircraft hardware" on public.aircraft_hardware;
create policy "All authenticated can view aircraft hardware" on public.aircraft_hardware
for select to authenticated using (true);

drop policy if exists "All authenticated can update aircraft hardware" on public.aircraft_hardware;
create policy "All authenticated can update aircraft hardware" on public.aircraft_hardware
for update to authenticated using (true) with check (true);

-- Aircraft maintenance logs
drop policy if exists "All authenticated can view aircraft maintenance logs" on public.aircraft_maintenance_log;
create policy "All authenticated can view aircraft maintenance logs" on public.aircraft_maintenance_log
for select to authenticated using (true);

drop policy if exists "All authenticated can update aircraft maintenance logs" on public.aircraft_maintenance_log;
create policy "All authenticated can update aircraft maintenance logs" on public.aircraft_maintenance_log
for update to authenticated using (true) with check (true);

-- Flight legs
drop policy if exists "All authenticated can view flight legs" on public.flight_legs;
create policy "All authenticated can view flight legs" on public.flight_legs
for select to authenticated using (true);

drop policy if exists "All authenticated can update flight legs" on public.flight_legs;
create policy "All authenticated can update flight legs" on public.flight_legs
for update to authenticated using (true) with check (true);

-- Flight leg logs metadata
drop policy if exists "All authenticated can view flight leg logs" on public.flight_leg_logs;
create policy "All authenticated can view flight leg logs" on public.flight_leg_logs
for select to authenticated using (true);

drop policy if exists "All authenticated can update flight leg logs" on public.flight_leg_logs;
create policy "All authenticated can update flight leg logs" on public.flight_leg_logs
for update to authenticated using (true) with check (true);

-- Flight leg tags
drop policy if exists "All authenticated can view flight leg tags" on public.flight_leg_tags;
create policy "All authenticated can view flight leg tags" on public.flight_leg_tags
for select to authenticated using (true);

drop policy if exists "All authenticated can update flight leg tags" on public.flight_leg_tags;
create policy "All authenticated can update flight leg tags" on public.flight_leg_tags
for update to authenticated using (true) with check (true);

