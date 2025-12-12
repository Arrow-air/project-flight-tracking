
-- ============================================================================
-- USER_PROFILES Policies
-- ============================================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profiles" 
    ON user_profiles
    FOR SELECT
    TO authenticated
    USING ( id = (SELECT auth.uid()) );

-- [!!!] Tricky [!!!]
-- Because RLS cascades from 'views', we must allow both SELECT and UPDATE
-- However, we deny access to 'user_profiles' in grants, preventing direct access
-- Therefore, only UPDATEs through the view are allowed
CREATE POLICY "Users can update their own profiles" 
    ON user_profiles
    FOR UPDATE
    TO authenticated
    USING ( id = (SELECT auth.uid()) )
    WITH CHECK ( id = (SELECT auth.uid()) ); -- ID must be same after update

-- user_profiles are created automatically when users sign up,
-- triggered by the on_auth_user_created function
CREATE POLICY "Users CANNOT create their own profiles" 
    ON user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK ( FALSE );

-- Delete should not be handled through UI
CREATE POLICY "Users CANNOT delete their own profiles" 
    ON user_profiles
    FOR DELETE
    TO authenticated
    USING ( FALSE );

-- WARNING: This policy is redundant. service_role bypasses RLS.
-- It exists only for explicit documentation of intended access.
-- CREATE POLICY "Service role can manage profiles"
--     ON user_profiles
--     FOR ALL
--     TO service_role
--     USING ((SELECT auth.role()) = 'service_role')
--     WITH CHECK ((SELECT auth.role()) = 'service_role');


-- ============================================================================
-- USER_UI_SETTINGS Policies
-- ============================================================================
ALTER TABLE user_ui_settings ENABLE ROW LEVEL SECURITY;

-- View their OWN UI settings on their profile page
CREATE POLICY "Users can view their own UI settings" 
    ON user_ui_settings
    FOR SELECT
    TO authenticated
    USING ( user_id = (SELECT auth.uid()) );

-- 
CREATE POLICY "Users CANNOT create their own UI settings" 
    ON user_ui_settings
    FOR INSERT
    TO authenticated
    WITH CHECK ( FALSE );

-- A user can only update their own UI settings
CREATE POLICY "Users can update their own UI settings" 
    ON user_ui_settings
    FOR UPDATE
    TO authenticated
    USING ( user_id = (SELECT auth.uid()) )
    WITH CHECK ( user_id = (SELECT auth.uid()) );

-- Don't delete UI settings. Cascade delete on user_profiles only.
CREATE POLICY "Users CANNOT delete their own UI settings" 
    ON user_ui_settings
    FOR DELETE
    TO authenticated
    USING ( FALSE );


-- ============================================================================
-- STRIPE_USER_BILLING Policies
-- ============================================================================
-- ALTER TABLE stripe_user_billing ENABLE ROW LEVEL SECURITY;

-- -- Only service_role can access
-- WARNING: This policy is redundant. service_role bypasses RLS.
-- It exists only for explicit documentation of intended access.
-- CREATE POLICY "Only service role can access billing data"
--     ON stripe_user_billing FOR ALL
--     TO service_role
--     USING (auth.role() = 'service_role')
--     WITH CHECK (auth.role() = 'service_role');

