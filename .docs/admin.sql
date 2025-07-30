-- Set a user as an admin
SELECT public.set_admin_claim('user-uuid-here', true);

-- Check if a user is an admin
SELECT public.is_admin('user-uuid-here');

-- Convert JSON array to text array
SELECT public.json_array_to_text_array('["apple", "banana", "cherry"]');

-- Convert JSON array to integer array
SELECT public.json_array_to_int_array('[1, 2, 3, 4]');

-----------------------------------------------------------

-- Function to check if a user has admin claims
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_claims JSONB;
BEGIN
    -- Retrieve user's app_metadata from auth.users
    SELECT raw_app_meta_data INTO user_claims
    FROM auth.users
    WHERE id = user_uuid;

    -- Check if user has admin claim
    RETURN COALESCE((user_claims->>'claims_admin')::BOOLEAN, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set admin claims for a user
CREATE OR REPLACE FUNCTION public.set_admin_claim(target_user_uuid UUID, is_admin BOOLEAN)
RETURNS VOID AS $$
DECLARE
    current_user_uuid UUID;
BEGIN
    -- Get the current user's UUID
    current_user_uuid := auth.uid();

    -- Check if the current user is an admin
    IF NOT public.is_admin(current_user_uuid) THEN
        RAISE EXCEPTION 'Only admins can modify admin claims';
    END IF;

    -- Update the user's app_metadata to set admin claim
    UPDATE auth.users
    SET raw_app_meta_data =
        jsonb_set(
            COALESCE(raw_app_meta_data, '{}'::JSONB),
            '{claims_admin}',
            to_jsonb(is_admin)
        )
    WHERE id = target_user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- RLS Policy to restrict admin functions
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example RLS Policy using the admin check function
CREATE POLICY "Admin only access" ON public.test_policy_table
FOR ALL
USING (public.check_admin_access())
WITH CHECK (public.check_admin_access());