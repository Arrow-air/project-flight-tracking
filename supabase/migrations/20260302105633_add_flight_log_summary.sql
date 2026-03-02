-- Add summary JSONB column to flight_leg_logs
-- Stores the structured flight diagnostic report generated from .bin log files
alter table public.flight_leg_logs
  add column if not exists summary jsonb default null;

-- Allow users to delete their own flight log records (fixes missing DELETE policy)
create policy "Users can delete their own flight logs"
  on public.flight_leg_logs
  for delete
  to authenticated
  using (uploaded_by_id = auth.uid());

-- Allow users to delete their own objects from storage
create policy "Users can delete their own flight log files"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'flight_logs' and (storage.foldername(name))[1] = auth.uid()::text);
