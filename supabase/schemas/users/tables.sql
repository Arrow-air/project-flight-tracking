
-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Identity
    -- email TEXT NOT NULL UNIQUE, -- Email must be of valid length [3-254]
    email TEXT UNIQUE, -- Email must be of valid length [3-254]
    display_name TEXT, -- How user is seen by others
    full_name TEXT,
    avatar_url TEXT,
    is_custom_avatar BOOLEAN NOT NULL DEFAULT FALSE, -- Whether user has uploaded their own avatar

    role user_role NOT NULL DEFAULT 'user', -- TODO: deprecate this?

    -- Lifecycle
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    is_deactivated BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

    -- Constraints
    CONSTRAINT user_profiles_email_chk
       CHECK ( utils.validate_email_format(email) )
    CONSTRAINT user_profiles_display_name_chk -- Allows NULL, validates non-NULL values
        CHECK (utils.validate_text(display_name, p_max_length => 80))
    CONSTRAINT user_profiles_full_name_chk
        CHECK ( utils.validate_text(full_name, p_max_length => 120))
    CONSTRAINT user_profiles_avatar_url_chk
        CHECK ( utils.validate_url(avatar_url) )
);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_full_name ON user_profiles(full_name);


-- One-to-one relationship with user_profiles
CREATE TABLE user_ui_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
    preferred_theme user_theme NOT NULL DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    timezone TEXT, -- Reserved for future use
    locale TEXT -- Future i18n
);


-- CREATE TABLE stripe_user_billing (
--     user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
--     stripe_sandbox_customer_id TEXT,
--     stripe_customer_id TEXT,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
