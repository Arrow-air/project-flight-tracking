-- User Organizations View
-- Provides a convenient way to query all organizations a user belongs to with their role
CREATE OR REPLACE VIEW client_user_organizations
    WITH (security_invoker)
    AS
    SELECT 
        org.*,
        om.role AS member_role,
        om.user_id,
        om.created_at AS member_since,
        om.updated_at AS membership_updated_at
    FROM 
        organizations org
        INNER JOIN organization_members om ON org.id = om.organization_id
    WHERE om.user_id = auth.uid();

ALTER VIEW client_user_organizations SET (security_invoker = true);


-- View for client-side views of organization members
-- Useful for dashboard of org members and their roles in it
-- Shows all members of organizations where the current user is a member
-- RLS on organization_members ensures users can only see members of their organizations
CREATE OR REPLACE VIEW client_organization_members
    WITH (security_invoker = true)
    AS
    SELECT
        om.id,
        om.organization_id,
        om.role,
        om.created_at AS member_since,
        om.updated_at AS member_updated_at,

        up.email,
        up.full_name,
        up.display_name,
        up.avatar_url,
        up.last_login_at AS last_seen_at,
        
        user_ui.timezone,
        user_ui.locale,

        org.name AS organization_name
    FROM
        organization_members om
        INNER JOIN organizations org ON om.organization_id = org.id
        INNER JOIN user_profiles up ON om.user_id = up.id
        INNER JOIN user_ui_settings user_ui ON up.id = user_ui.user_id
    WHERE om.organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid()
    );

-- Explicitly set security_invoker to ensure RLS is enforced
-- Views inherit RLS from underlying tables, but only if security_invoker is set
ALTER VIEW client_organization_members SET (security_invoker = true);
