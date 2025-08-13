
-- INSERT: Everyone logged in may upload to this bucket; owner_id is auto-set.
CREATE POLICY "auth users can insert flight logs"
ON storage.objects
FOR insert
TO authenticated
WITH CHECK (bucket_id = 'flight_logs');

-- READ (download/list) own objects in flight_logs
-- Read/update/delete only what I own (no path parsing)
CREATE POLICY "owner can read their flight logs"
ON storage.objects
FOR select
TO authenticated
USING (bucket_id = 'flight_logs' and (select auth.uid()) = owner_id::uuid );


-- OPTIONAL: UPDATE (rename/metadata) only their own objects
CREATE POLICY "owner can update their flight logs"
ON storage.objects
FOR update
TO authenticated
USING (bucket_id = 'flight_logs' and (select auth.uid()) = owner_id::uuid)
WITH CHECK (bucket_id = 'flight_logs' and (select auth.uid()) = owner_id::uuid);

-- OPTIONAL: DELETE their own objects
CREATE POLICY "owner can delete their flight logs"
ON storage.objects
FOR delete
TO authenticated
USING (bucket_id = 'flight_logs' and (select auth.uid()) = owner_id::uuid);
