-- RLS Policies for Organizations
-- All row-level security policies for organization-related tables

-- ============================================================================
-- ORGANIZATIONS POLICIES
-- ============================================================================
-- Users can only view/modify organizations they are members of
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own organizations"
    ON organizations 
    FOR SELECT
    TO authenticated
    USING (user_is_org_member(id));

CREATE POLICY "Authenticated users can create organizations"
    ON organizations 
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Admins can update their own organizations" 
    ON organizations 
    FOR UPDATE 
    TO authenticated
    USING (user_is_org_admin(id));

CREATE POLICY "Owners can delete their own organizations" 
    ON organizations 
    FOR DELETE 
    TO authenticated
    USING (user_is_org_owner(id));

-- ============================================================================
-- ORGANIZATION_MEMBERS POLICIES
-- ============================================================================
-- Members can view their own organization's membership
-- Only admins/owners can modify membership (prepared for future RBAC)
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their organization's members" 
    ON organization_members
    FOR SELECT
    TO authenticated
    USING ( user_is_org_member(organization_id) );

CREATE POLICY "Admins can add members to their organization" 
    ON organization_members
    FOR INSERT 
    TO authenticated
    WITH CHECK ( user_is_org_admin(organization_id) AND
        -- Prevent privilege escalation: only owners can create owner accounts
        ( role != 'owner' OR user_is_org_owner(organization_id) )
    );

CREATE POLICY "Admins can update members in their organization" 
    ON organization_members
    FOR UPDATE
    TO authenticated
    USING (
        -- Can only update org members at all if admin
        user_is_org_admin(organization_id) 
        -- Only owners can update owner members
        -- Also prevents demotion of owners by non-owners
        AND (role != 'owner' OR user_is_org_owner(organization_id))
    ) 
    WITH CHECK (
        -- Prevent privilege escalation: only owners can promote to owner
        (role != 'owner' OR user_is_org_owner(organization_id))
    );

CREATE POLICY "Admins can remove members from their organization" 
    ON organization_members
    FOR DELETE
    TO authenticated
    USING ( 
        -- Can only update org members at all if admin
        user_is_org_admin(organization_id)
        -- Prevent privilege escalation: only owners can remove owners
        AND ( role != 'owner' OR user_is_org_owner(organization_id) )
        -- Admins cannot mutually remove each other
        -- Admins can self-remove w/ "Users can leave an organization" policy
        AND ( role != 'admin' OR user_is_org_owner(organization_id) )
    );

CREATE POLICY "Users can leave an organization" 
    ON organization_members
    FOR DELETE
    TO authenticated
    USING ( user_id = (SELECT auth.uid()) );
