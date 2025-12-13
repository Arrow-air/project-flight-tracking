-- [Organizations] Table
-- ======================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name VARCHAR NOT NULL UNIQUE,
    description VARCHAR,
    website_url VARCHAR,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT organizations_email_chk
        CHECK ( utils.validate_email_format(email) ),
    CONSTRAINT organizations_website_url_chk
        CHECK ( utils.validate_url(website_url) )
);
CREATE INDEX idx_organizations_name ON organizations(name);

CREATE TRIGGER handle_updated_at_organizations
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION extensions.moddatetime(updated_at);


-- [Organization Members] Table
-- ========================================
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    role organization_member_role NOT NULL DEFAULT 'member',
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(organization_id, user_id) -- Prevent duplicate members for organizations
);
CREATE INDEX idx_organization_members_organization_id ON organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);

CREATE TRIGGER handle_updated_at_organization_members
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION extensions.moddatetime(updated_at);


