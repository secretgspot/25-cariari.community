-- Set a user as an admin
SELECT public.set_admin_claim('user-uuid-here', true);

-- Check if a user is an admin
SELECT public.is_admin('user-uuid-here');

-- Convert JSON array to text array
SELECT public.json_array_to_text_array('["apple", "banana", "cherry"]');

-- Convert JSON array to integer array
SELECT public.json_array_to_int_array('[1, 2, 3, 4]');

-----------------------------------------------------------

-- Function to convert JSON array to PostgreSQL text array
CREATE OR REPLACE FUNCTION public.json_array_to_text_array(json_input JSONB)
RETURNS TEXT[] AS $$
DECLARE
    text_array TEXT[];
BEGIN
    -- Convert JSONB array to PostgreSQL text array
    SELECT ARRAY(
        SELECT jsonb_array_elements_text(json_input)
    ) INTO text_array;

    RETURN text_array;
END;
$$ LANGUAGE plpgsql;

-- Function to convert JSON array to PostgreSQL integer array
CREATE OR REPLACE FUNCTION public.json_array_to_int_array(json_input JSONB)
RETURNS INTEGER[] AS $$
DECLARE
    int_array INTEGER[];
BEGIN
    -- Convert JSONB array to PostgreSQL integer array
    SELECT ARRAY(
        SELECT (jsonb_array_elements(json_input))::INTEGER
    ) INTO int_array;

    RETURN int_array;
END;
$$ LANGUAGE plpgsql;






-----------------------------------------------------------


-- Delete a specific claim from a user's app_metadata
CREATE OR REPLACE FUNCTION public.delete_claim(
  "uid" UUID,
  "claim" TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if the current user has claims admin privileges
  IF NOT is_claims_admin() THEN
    RETURN 'error: access denied';
  END IF;

  -- Safely remove the specified claim
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data - claim
  WHERE id = uid;

  RETURN 'OK';
END;
$$;

-- Retrieve a specific claim for a user
CREATE OR REPLACE FUNCTION public.get_claim(
  "uid" UUID,
  "claim" TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  claim_value JSONB;
BEGIN
  -- Check if the current user has claims admin privileges
  IF NOT is_claims_admin() THEN
    RETURN '{"error": "access denied"}'::JSONB;
  END IF;

  -- Retrieve the specific claim, return NULL if not found
  SELECT raw_app_meta_data->claim
  INTO claim_value
  FROM auth.users
  WHERE id = uid;

  RETURN claim_value;
END;
$$;

-- Retrieve all claims for a specific user
CREATE OR REPLACE FUNCTION public.get_claims(
  "uid" UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_claims JSONB;
BEGIN
  -- Check if the current user has claims admin privileges
  IF NOT is_claims_admin() THEN
    RETURN '{"error": "access denied"}'::JSONB;
  END IF;

  -- Retrieve all claims for the specified user
  SELECT raw_app_meta_data
  INTO user_claims
  FROM auth.users
  WHERE id = uid;

  RETURN COALESCE(user_claims, '{}'::JSONB);
END;
$$;

-- Retrieve a specific claim for the current user
CREATE OR REPLACE FUNCTION public.get_my_claim(
  "claim" TEXT
)
RETURNS JSONB
LANGUAGE SQL
STABLE
AS $$
  SELECT
    COALESCE(
      NULLIF(current_setting('request.jwt.claims', true), '')::JSONB
      -> 'app_metadata'
      -> claim,
      NULL
    )
$$;

-- Retrieve all claims for the current user
CREATE OR REPLACE FUNCTION public.get_my_claims()
RETURNS JSONB
LANGUAGE SQL
STABLE
AS $$
  SELECT
    COALESCE(
      NULLIF(current_setting('request.jwt.claims', true), '')::JSONB
      -> 'app_metadata',
      '{}'::JSONB
    )::JSONB
$$;

-- Check if the current user is a claims admin
CREATE OR REPLACE FUNCTION public.is_claims_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  jwt_claims JSONB;
  current_exp NUMERIC;
BEGIN
  -- Only apply checks for authenticator session
  IF session_user != 'authenticator' THEN
    RETURN TRUE; -- Trusted system calls always allowed
  END IF;

  -- Get current JWT claims
  jwt_claims := current_setting('request.jwt.claims', true)::JSONB;

  -- Extract expiration time
  current_exp := COALESCE((jwt_claims->>'exp')::NUMERIC, 0);

  -- Check for expired JWT
  IF extract(epoch from now()) > current_exp THEN
    RETURN FALSE; -- JWT has expired
  END IF;

  -- Check for claims_admin flag in app_metadata
  RETURN COALESCE(
    (jwt_claims->'app_metadata'->>'claims_admin')::BOOLEAN,
    FALSE
  );
END;
$$;

-- Set a specific claim for a user
CREATE OR REPLACE FUNCTION public.set_claim(
  "uid" UUID,
  "claim" TEXT,
  "value" JSONB
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if the current user has claims admin privileges
  IF NOT is_claims_admin() THEN
    RETURN 'error: access denied';
  END IF;

  -- Update the specified claim for the user
  UPDATE auth.users
  SET raw_app_meta_data =
    raw_app_meta_data ||
    json_build_object(claim, value)::JSONB
  WHERE id = uid;

  RETURN 'OK';
END;
$$;