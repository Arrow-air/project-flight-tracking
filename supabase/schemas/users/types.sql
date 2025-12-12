

-- Application users with roles and authentication
CREATE TYPE user_role AS ENUM (
    'super_admin', 
    'admin', 
    'moderator', 
    'user'
);

-- User theme preferences
CREATE TYPE user_theme AS ENUM (
    'light',
    'dark',
    'system'
);