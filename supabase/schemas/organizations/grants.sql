-- Tables
-- ========================================
-- [organizations]
GRANT SELECT, INSERT, UPDATE, DELETE ON organizations TO authenticated;

-- [organization_members]
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_members TO authenticated;


-- Views
-- ========================================
-- [client_user_organizations]
GRANT SELECT ON client_user_organizations TO authenticated;

-- [client_organization_members]
GRANT SELECT ON client_organization_members TO authenticated;

-- Functions
-- ========================================
-- [ org_rls_helpers ]
GRANT EXECUTE ON FUNCTION user_is_org_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_is_org_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_is_org_owner(UUID) TO authenticated;

