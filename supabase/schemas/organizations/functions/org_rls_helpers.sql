-- Organization Membership Helper Functions
-- Reusable functions for checking organization membership and roles
-- These functions are optimized for use in RLS policies



-- Check if the current user is a member of a specific organization
-- Returns: Boolean
CREATE OR REPLACE FUNCTION user_is_org_member(p_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_id = p_organization_id
        AND user_id = auth.uid()
    );
$$;

COMMENT ON FUNCTION user_is_org_member(UUID) IS 'Returns true if current user is a member of the specified organization';


-- Check if the current user is an admin or owner of a specific organization
-- Returns: Boolean
CREATE OR REPLACE FUNCTION user_is_org_admin(p_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_id = p_organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    );
$$;

COMMENT ON FUNCTION user_is_org_admin(UUID) IS 'Returns true if current user is an admin or owner of the specified organization';


-- Check if the current user is an owner of a specific organization
-- Returns: Boolean
CREATE OR REPLACE FUNCTION user_is_org_owner(p_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_id = p_organization_id
        AND user_id = auth.uid()
        AND role = 'owner'
    );
$$;

COMMENT ON FUNCTION user_is_org_owner(UUID) IS 'Returns true if current user is an owner of the specified organization';

