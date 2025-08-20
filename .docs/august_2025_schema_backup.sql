

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."delete_claim"("uid" "uuid", "claim" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."delete_claim"("uid" "uuid", "claim" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_event_image"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
    -- Check if image_url exists and is not null before attempting deletion
    IF OLD.image_url IS NOT NULL AND OLD.image_url != '' THEN
        -- Extract the file path from the image_url for events folder
        DELETE FROM storage.objects 
        WHERE name = 'events/' || substring(OLD.image_url FROM 'uploads/events/(.*)$');
    END IF;
    RETURN OLD;
END;
$_$;


ALTER FUNCTION "public"."delete_event_image"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_expired_events"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    DELETE FROM events 
    WHERE event_end_date < CURRENT_TIMESTAMP;
END;
$$;


ALTER FUNCTION "public"."delete_expired_events"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_expired_lost_and_found"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    DELETE FROM lost_and_found 
    WHERE created_at < NOW() - INTERVAL '14 days';
END;
$$;


ALTER FUNCTION "public"."delete_expired_lost_and_found"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_expired_notices"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    DELETE FROM notices 
    WHERE 
        -- Delete when end_date is not null and has passed
        (end_date IS NOT NULL AND end_date < NOW())
        OR 
        -- Delete when end_date is null and created_at is more than 30 days old
        (end_date IS NULL AND created_at < NOW() - INTERVAL '30 days');
END;
$$;


ALTER FUNCTION "public"."delete_expired_notices"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_expired_services"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    DELETE FROM services 
    WHERE end_date < CURRENT_TIMESTAMP;
END;$$;


ALTER FUNCTION "public"."delete_expired_services"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_lost_and_found_image"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
    IF OLD.image_url IS NOT NULL AND OLD.image_url != '' THEN
        -- Extract the file path from the image_url for lost-and-found folder
        DELETE FROM storage.objects 
        WHERE name = 'lost-and-found/' || substring(OLD.image_url FROM 'uploads/lost-and-found/(.*)$');
    END IF;
    RETURN OLD;
END;
$_$;


ALTER FUNCTION "public"."delete_lost_and_found_image"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_service_image"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
    IF OLD.image_url IS NOT NULL AND OLD.image_url != '' THEN
        -- Extract the file path from the image_url for services folder
        DELETE FROM storage.objects 
        WHERE name = 'services/' || substring(OLD.image_url FROM 'uploads/services/(.*)$');
    END IF;
    RETURN OLD;
END;
$_$;


ALTER FUNCTION "public"."delete_service_image"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_claim"("uid" "uuid", "claim" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."get_claim"("uid" "uuid", "claim" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_claims"("uid" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."get_claims"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_claim"("claim" "text") RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT 
    COALESCE(
      NULLIF(current_setting('request.jwt.claims', true), '')::JSONB 
      -> 'app_metadata' 
      -> claim, 
      NULL
    )
$$;


ALTER FUNCTION "public"."get_my_claim"("claim" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_claims"() RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT 
    COALESCE(
      NULLIF(current_setting('request.jwt.claims', true), '')::JSONB 
      -> 'app_metadata', 
      '{}'::JSONB
    )::JSONB
$$;


ALTER FUNCTION "public"."get_my_claims"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("uid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE 
  admin_claim JSONB;
BEGIN
  admin_claim := public.get_claim(uid, 'admin');
  
  -- Return false if claim doesn't exist or is not true
  RETURN COALESCE(admin_claim::text::boolean, false);
END;
$$;


ALTER FUNCTION "public"."is_admin"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_claims_admin"() RETURNS boolean
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."is_claims_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_admin_claim"("uid" "uuid", "is_admin" boolean) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN public.set_claim(
    uid, 
    'admin', 
    to_jsonb(is_admin)
  );
END;
$$;


ALTER FUNCTION "public"."set_admin_claim"("uid" "uuid", "is_admin" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_claim"("uid" "uuid", "claim" "text", "value" "jsonb") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."set_claim"("uid" "uuid", "claim" "text", "value" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "notice_id" "uuid",
    "event_id" "uuid",
    "lost_and_found_id" "uuid",
    "service_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "comments_single_parent_check" CHECK ((((((("notice_id" IS NOT NULL))::integer + (("event_id" IS NOT NULL))::integer) + (("lost_and_found_id" IS NOT NULL))::integer) + (("service_id" IS NOT NULL))::integer) = 1))
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "event_start_date" timestamp without time zone NOT NULL,
    "event_end_date" timestamp without time zone,
    "location" "text",
    "image_url" "text",
    "category" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lost_and_found" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "category" "text" NOT NULL,
    "date" "date" NOT NULL,
    "location" "text",
    "contact" "text" NOT NULL,
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lost_and_found" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notices" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "urgency" "text",
    "start_date" timestamp without time zone,
    "end_date" timestamp without time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "category" "text",
    "image_url" "text",
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."services" OWNER TO "postgres";


ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lost_and_found"
    ADD CONSTRAINT "lost_and_found_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notices"
    ADD CONSTRAINT "notices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_comments_created_at" ON "public"."comments" USING "btree" ("created_at");



CREATE INDEX "idx_comments_event_id" ON "public"."comments" USING "btree" ("event_id") WHERE ("event_id" IS NOT NULL);



CREATE INDEX "idx_comments_lost_and_found_id" ON "public"."comments" USING "btree" ("lost_and_found_id") WHERE ("lost_and_found_id" IS NOT NULL);



CREATE INDEX "idx_comments_notice_id" ON "public"."comments" USING "btree" ("notice_id") WHERE ("notice_id" IS NOT NULL);



CREATE INDEX "idx_comments_service_id" ON "public"."comments" USING "btree" ("service_id") WHERE ("service_id" IS NOT NULL);



CREATE INDEX "idx_comments_user_id" ON "public"."comments" USING "btree" ("user_id");



CREATE INDEX "idx_comments_user_id_created_at" ON "public"."comments" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_events_end_date" ON "public"."events" USING "btree" ("event_end_date");



CREATE INDEX "idx_events_start_date" ON "public"."events" USING "btree" ("event_start_date");



CREATE INDEX "idx_events_user_id" ON "public"."events" USING "btree" ("user_id");



CREATE INDEX "idx_events_user_id_created_at" ON "public"."events" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_lost_and_found_user_id" ON "public"."lost_and_found" USING "btree" ("user_id");



CREATE INDEX "idx_lost_and_found_user_id_created_at" ON "public"."lost_and_found" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_notices_user_id" ON "public"."notices" USING "btree" ("user_id");



CREATE INDEX "idx_notices_user_id_created_at" ON "public"."notices" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_profiles_user_id" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "idx_services_end_date" ON "public"."services" USING "btree" ("end_date");



CREATE INDEX "idx_services_user_id" ON "public"."services" USING "btree" ("user_id");



CREATE INDEX "idx_services_user_id_created_at" ON "public"."services" USING "btree" ("user_id", "created_at" DESC);



CREATE OR REPLACE TRIGGER "delete_event_image_on_delete" AFTER DELETE ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."delete_event_image"();



CREATE OR REPLACE TRIGGER "delete_lost_and_found_image_on_delete" AFTER DELETE ON "public"."lost_and_found" FOR EACH ROW EXECUTE FUNCTION "public"."delete_lost_and_found_image"();



CREATE OR REPLACE TRIGGER "delete_service_image_on_delete" AFTER DELETE ON "public"."services" FOR EACH ROW EXECUTE FUNCTION "public"."delete_service_image"();



CREATE OR REPLACE TRIGGER "update_comments_updated_at" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_lost_and_found_id_fkey" FOREIGN KEY ("lost_and_found_id") REFERENCES "public"."lost_and_found"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_notice_id_fkey" FOREIGN KEY ("notice_id") REFERENCES "public"."notices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lost_and_found"
    ADD CONSTRAINT "lost_and_found_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notices"
    ADD CONSTRAINT "notices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin can manage all comments" ON "public"."comments" USING ((((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'admin'::"text"))::boolean = true));



CREATE POLICY "Admin can manage all events" ON "public"."events" USING ((((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'admin'::"text"))::boolean = true));



CREATE POLICY "Admin can manage all lost and found" ON "public"."lost_and_found" TO "authenticated" USING ((((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'admin'::"text"))::boolean = true));



CREATE POLICY "Admin can manage all notices" ON "public"."notices" USING ((((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'admin'::"text"))::boolean = true));



CREATE POLICY "Admin can manage all profiles" ON "public"."profiles" USING ((((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'admin'::"text"))::boolean = true));



CREATE POLICY "Admin can manage all services" ON "public"."services" USING ((((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'admin'::"text"))::boolean = true));



CREATE POLICY "Comments are viewable by everyone" ON "public"."comments" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Public can view published events" ON "public"."events" FOR SELECT USING (true);



CREATE POLICY "Public can view published lost and found" ON "public"."lost_and_found" FOR SELECT USING (true);



CREATE POLICY "Public can view published notices" ON "public"."notices" FOR SELECT USING (true);



CREATE POLICY "Public can view published services" ON "public"."services" FOR SELECT USING (true);



CREATE POLICY "Users can create their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own events" ON "public"."events" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own lost and found" ON "public"."lost_and_found" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own notices" ON "public"."notices" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own services" ON "public"."services" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own comments" ON "public"."comments" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own events" ON "public"."events" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own lost and found" ON "public"."lost_and_found" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own notices" ON "public"."notices" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own services" ON "public"."services" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own comments" ON "public"."comments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own events" ON "public"."events" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own lost and found" ON "public"."lost_and_found" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own notices" ON "public"."notices" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own services" ON "public"."services" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own comments" ON "public"."comments" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lost_and_found" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";














































































































































































GRANT ALL ON FUNCTION "public"."delete_claim"("uid" "uuid", "claim" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_claim"("uid" "uuid", "claim" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_claim"("uid" "uuid", "claim" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_event_image"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_event_image"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_event_image"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_expired_events"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_expired_events"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_expired_events"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_expired_lost_and_found"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_expired_lost_and_found"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_expired_lost_and_found"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_expired_notices"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_expired_notices"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_expired_notices"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_expired_services"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_expired_services"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_expired_services"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_lost_and_found_image"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_lost_and_found_image"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_lost_and_found_image"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_service_image"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_service_image"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_service_image"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_claim"("uid" "uuid", "claim" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_claim"("uid" "uuid", "claim" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_claim"("uid" "uuid", "claim" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_claims"("uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_claims"("uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_claims"("uid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_claims"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_claims"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_claims"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_claims_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_claims_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_claims_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_admin_claim"("uid" "uuid", "is_admin" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."set_admin_claim"("uid" "uuid", "is_admin" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_admin_claim"("uid" "uuid", "is_admin" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_claim"("uid" "uuid", "claim" "text", "value" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."set_claim"("uid" "uuid", "claim" "text", "value" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_claim"("uid" "uuid", "claim" "text", "value" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
























GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."lost_and_found" TO "anon";
GRANT ALL ON TABLE "public"."lost_and_found" TO "authenticated";
GRANT ALL ON TABLE "public"."lost_and_found" TO "service_role";



GRANT ALL ON TABLE "public"."notices" TO "anon";
GRANT ALL ON TABLE "public"."notices" TO "authenticated";
GRANT ALL ON TABLE "public"."notices" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
