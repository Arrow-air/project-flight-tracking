-- ========================================
-- Field Validators
-- ========================================

-- Email Format Validation
-- ========================================
-- Function to validate email format, ensure legitimate format and length
CREATE OR REPLACE FUNCTION utils.validate_email_format(p_email text)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE -- Pure mathematical function
STRICT -- Null input returns NULL
PARALLEL SAFE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_normalized_email text;
BEGIN

  v_normalized_email := LOWER(TRIM(p_email));

  -- Email must be non-null and non-empty
  IF v_normalized_email IS NULL OR LENGTH(TRIM(v_normalized_email)) = 0 THEN
    RAISE NOTICE 'Email is required and cannot be empty';
    RETURN FALSE;
  END IF;

  -- Email must be of valid length [3-254] characters
  IF LENGTH(TRIM(v_normalized_email)) > 254 THEN
    RAISE NOTICE 'Email is too long (max 254 characters): %', v_normalized_email;
    RETURN FALSE;
  END IF;

  IF LENGTH(TRIM(v_normalized_email)) < 3 THEN
    RAISE NOTICE 'Email is too short (min 3 characters): %', v_normalized_email;
    RETURN FALSE;
  END IF;

  -- Validate email format
  IF NOT v_normalized_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE NOTICE 'Invalid email format: %', v_normalized_email;
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;



-- Validate user-supplied URLs
-- ========================================
CREATE OR REPLACE FUNCTION utils.validate_url(p_url text)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE -- Pure mathematical function
STRICT -- Null input returns NULL
PARALLEL SAFE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_normalized_url text;
BEGIN

  v_normalized_url := LOWER(TRIM(p_url));

  -- URL must be non-null and non-empty
  IF v_normalized_url IS NULL OR LENGTH(TRIM(v_normalized_url)) = 0 THEN
    RAISE NOTICE 'URL is NULL or empty';
    RETURN FALSE;
  END IF;

  -- URL must be of valid length [3-2048] characters
  IF LENGTH(TRIM(v_normalized_url)) > 2048 THEN
    RAISE NOTICE 'URL is too long (max 254 characters): %', v_normalized_url;
    RETURN FALSE;
  END IF;

  IF LENGTH(TRIM(v_normalized_url)) < 3 THEN
    RAISE NOTICE 'URL is too short (min 3 characters): %', v_normalized_url;
    RETURN FALSE;
  END IF;
  
  -- Validate URL format
  IF NOT v_normalized_url ~* '^https?://' THEN
    RAISE NOTICE 'Invalid URL format: %', v_normalized_url;
    RETURN FALSE;
  END IF;

  -- Validate URL is a valid URL
  IF v_normalized_url !~* '<|>' THEN -- No HTML, script tags
    RAISE NOTICE 'URL contains HTML or script tags: %', v_normalized_url;
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;
