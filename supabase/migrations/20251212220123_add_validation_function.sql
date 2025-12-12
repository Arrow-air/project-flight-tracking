set check_function_bodies = off;

CREATE OR REPLACE FUNCTION utils.validate_text(p_text text, p_max_length integer DEFAULT 2048, p_min_length integer DEFAULT 0)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE PARALLEL SAFE STRICT
 SET search_path TO ''
AS $function$
DECLARE
  v_normalized_text text;
BEGIN

  v_normalized_text := LOWER(TRIM(p_text));

  -- URL must be of valid length [3-2048] characters
  IF LENGTH(TRIM(v_normalized_text)) > p_max_length THEN
    RAISE NOTICE 'Text is too long (max % characters): %', p_max_length, v_normalized_text;
    RETURN FALSE;
  END IF;

  IF LENGTH(TRIM(v_normalized_text)) < p_min_length THEN
    RAISE NOTICE 'Text is too short (min % characters): %', p_min_length, v_normalized_text;
    RETURN FALSE;
  END IF;

  -- Validate text contains no HTML, script tags
  IF v_normalized_text ~* '<|>' THEN
    RAISE NOTICE 'Text contains HTML or script tags: %', v_normalized_text;
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$function$
;


