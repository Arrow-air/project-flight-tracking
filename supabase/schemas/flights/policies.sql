
-- =============================================================
-- Flight Legs Policies
-- =============================================================
ALTER TABLE public.flight_legs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flight runs" ON public.flight_legs
    FOR SELECT 
    TO authenticated 
    USING ((SELECT auth.uid()) = pilot_id);

CREATE POLICY "All authenticated can view flight legs" ON public.flight_legs
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Users can create flight runs" ON public.flight_legs
    FOR INSERT 
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = pilot_id);

CREATE POLICY "Users can update own flight runs" ON public.flight_legs
    FOR UPDATE
    TO authenticated 
    USING ((SELECT auth.uid()) = pilot_id)
    WITH CHECK ((SELECT auth.uid()) = pilot_id);

CREATE POLICY "All authenticated can update flight legs" ON public.flight_legs
    FOR UPDATE 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete own flight runs" ON public.flight_legs
    FOR DELETE 
    TO authenticated 
    USING ((SELECT auth.uid()) = pilot_id);


-- =============================================================
-- Flight Notes Policies
-- =============================================================
ALTER TABLE public.flight_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flight notes" ON public.flight_notes
    FOR SELECT 
    TO authenticated 
    USING ((SELECT auth.uid()) = author_id);

CREATE POLICY "Users can create flight notes" ON public.flight_notes
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = author_id);

CREATE POLICY "Users can update own flight notes" ON public.flight_notes
    FOR UPDATE
    USING ((SELECT auth.uid()) = author_id)
    WITH CHECK ((SELECT auth.uid()) = author_id);

CREATE POLICY "Users can delete own flight notes"
  ON public.flight_notes
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = author_id);


-- =============================================================
-- Flight Leg Logs Policies
-- =============================================================
ALTER TABLE public.flight_leg_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flight leg logs" ON public.flight_leg_logs
    FOR SELECT 
    TO authenticated 
    USING ((SELECT auth.uid()) = uploaded_by_id);

CREATE POLICY "All authenticated can view flight leg logs" ON public.flight_leg_logs
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Users can create flight leg logs" ON public.flight_leg_logs
    FOR INSERT 
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = uploaded_by_id);

CREATE POLICY "Users can update own flight leg logs" ON public.flight_leg_logs
    FOR UPDATE 
    TO authenticated 
    USING ((SELECT auth.uid()) = uploaded_by_id)
    WITH CHECK ((SELECT auth.uid()) = uploaded_by_id);

CREATE POLICY "All authenticated can update flight leg logs" ON public.flight_leg_logs
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete own flight leg logs"
    ON public.flight_leg_logs
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = uploaded_by_id);


-- =============================================================
-- Flight Leg Tags Policies
-- =============================================================
ALTER TABLE public.flight_leg_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flight leg tags" ON public.flight_leg_tags
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = tagged_by_id);

CREATE POLICY "All authenticated can view flight leg tags" ON public.flight_leg_tags
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create flight leg tags" ON public.flight_leg_tags
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = tagged_by_id);

CREATE POLICY "Users can update own flight leg tags" ON public.flight_leg_tags
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = tagged_by_id)
    WITH CHECK ((SELECT auth.uid()) = tagged_by_id);

CREATE POLICY "All authenticated can update flight leg tags" ON public.flight_leg_tags
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
    
CREATE POLICY "Users can delete own flight leg tags" ON public.flight_leg_tags
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = tagged_by_id);




