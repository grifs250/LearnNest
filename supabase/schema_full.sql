

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


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."booking_status" AS ENUM (
    'pending',
    'confirmed',
    'cancelled',
    'completed'
);


ALTER TYPE "public"."booking_status" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'pending',
    'paid',
    'refunded',
    'failed'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'student',
    'teacher',
    'admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_table_exists"("table_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  );
END;
$_$;


ALTER FUNCTION "public"."check_table_exists"("table_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_work_hours_table"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'teacher_work_hours'
  ) THEN
    CREATE TABLE public.teacher_work_hours (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      day_0 TEXT, -- Sunday
      day_1 TEXT, -- Monday
      day_2 TEXT, -- Tuesday
      day_3 TEXT, -- Wednesday
      day_4 TEXT, -- Thursday
      day_5 TEXT, -- Friday
      day_6 TEXT, -- Saturday
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE public.teacher_work_hours ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies using Clerk JWT
    CREATE POLICY "teacher_work_hours_select_policy"
      ON public.teacher_work_hours
      FOR SELECT
      USING (
        teacher_id IN (
          SELECT id FROM profiles 
          WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        )
      );

    CREATE POLICY "teacher_work_hours_insert_policy"
      ON public.teacher_work_hours
      FOR INSERT
      WITH CHECK (
        teacher_id IN (
          SELECT id FROM profiles 
          WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        )
      );

    CREATE POLICY "teacher_work_hours_update_policy"
      ON public.teacher_work_hours
      FOR UPDATE
      USING (
        teacher_id IN (
          SELECT id FROM profiles 
          WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        )
      )
      WITH CHECK (
        teacher_id IN (
          SELECT id FROM profiles 
          WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        )
      );
  END IF;
END;
$$;


ALTER FUNCTION "public"."create_work_hours_table"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_user_id"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    SELECT user_id FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    LIMIT 1;
$$;


ALTER FUNCTION "public"."get_current_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_lesson_counts_by_subject"() RETURNS TABLE("subject_id" "text", "count" bigint)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  -- Get count of active lessons for each subject
  SELECT 
    l.subject_id,
    COUNT(l.id)::bigint as count
  FROM 
    lessons l
  WHERE 
    l.is_active = true
  GROUP BY 
    l.subject_id;
$$;


ALTER FUNCTION "public"."get_lesson_counts_by_subject"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_teacher_availability"("teacher_id" "uuid", "start_date" "date", "end_date" "date") RETURNS TABLE("date" "date", "available_slots" "jsonb")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    WITH teacher_schedule AS (
        SELECT 
            ls.id,
            ls.start_time::DATE as date,
            jsonb_build_object(
                'id', ls.id,
                'start', ls.start_time,
                'end', ls.end_time,
                'is_available', ls.is_available
            ) as slot
        FROM lesson_schedules ls
        JOIN lessons l ON l.id = ls.lesson_id
        WHERE l.teacher_id = teacher_id
        AND ls.start_time::DATE BETWEEN start_date AND end_date
        AND ls.is_available = true
    )
    SELECT 
        ts.date,
        jsonb_agg(ts.slot) as available_slots
    FROM teacher_schedule ts
    GROUP BY ts.date
    ORDER BY ts.date;
END;
$$;


ALTER FUNCTION "public"."get_teacher_availability"("teacher_id" "uuid", "start_date" "date", "end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_teacher_lesson_count"("teacher_profile_id" "text") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM bookings b
    JOIN lesson_schedules ls ON b.schedule_id = ls.id
    JOIN lessons l ON ls.lesson_id = l.id
    WHERE l.teacher_id = teacher_profile_id AND b.status = 'completed'
  );
END;
$$;


ALTER FUNCTION "public"."get_teacher_lesson_count"("teacher_profile_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "public"."user_role"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    SELECT role FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    LIMIT 1;
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("required_role" "public"."user_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        AND role = required_role
    );
$$;


ALTER FUNCTION "public"."has_role"("required_role" "public"."user_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_teacher"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    AND role = 'teacher'
  )
$$;


ALTER FUNCTION "public"."is_teacher"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_profile_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO audit_log (
    table_name, 
    record_id, 
    action, 
    old_data, 
    new_data, 
    changed_by
  ) VALUES (
    TG_TABLE_NAME,
    NEW.id,
    TG_OP,
    row_to_json(OLD),
    row_to_json(NEW),
    current_setting('request.jwt.claims', true)::jsonb->>'sub'
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_profile_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_subject_lesson_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  affected_subject_id text;
  current_count bigint;
  current_metadata jsonb;
  updated_metadata jsonb;
BEGIN
  -- Get affected subject_id based on the operation
  IF (TG_OP = 'DELETE') THEN
    affected_subject_id := OLD.subject_id;
  ELSE
    affected_subject_id := NEW.subject_id;
  END IF;
  
  -- Get current count of active lessons for this subject
  SELECT COUNT(id)::bigint INTO current_count
  FROM lessons
  WHERE subject_id = affected_subject_id
  AND is_active = true;
  
  -- Get current metadata
  SELECT COALESCE(metadata, '{}'::jsonb) INTO current_metadata
  FROM subjects
  WHERE id = affected_subject_id;
  
  -- Update metadata with lesson count
  updated_metadata := jsonb_set(
    current_metadata, 
    '{lesson_count}', 
    to_jsonb(current_count)
  );
  
  -- Update the subject with new count
  UPDATE subjects
  SET 
    metadata = updated_metadata,
    updated_at = NOW()
  WHERE id = affected_subject_id;
  
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_subject_lesson_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_booking_schedule"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Check if schedule is available
    IF NOT EXISTS (
        SELECT 1 FROM lesson_schedules
        WHERE id = NEW.schedule_id
        AND is_available = true
        AND start_time > now()
    ) THEN
        RAISE EXCEPTION 'Schedule is not available';
    END IF;

    -- Check for schedule conflicts
    IF EXISTS (
        SELECT 1 FROM bookings
        WHERE schedule_id = NEW.schedule_id
        AND status NOT IN ('cancelled', 'completed')
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ) THEN
        RAISE EXCEPTION 'Schedule already booked';
    END IF;

    -- Check student booking limit
    IF (
        SELECT COUNT(*) FROM bookings
        WHERE student_id = NEW.student_id
        AND status = 'pending'
    ) >= 5 THEN
        RAISE EXCEPTION 'Too many pending bookings';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_booking_schedule"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_profile_id"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF LENGTH(NEW.id) < 32 THEN
    RAISE EXCEPTION 'Profile ID must be at least 32 characters';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_profile_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_profile_role"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Validate teacher data
    IF NEW.role = 'teacher' AND NEW.hourly_rate IS NULL THEN
        NEW.hourly_rate := 0.00;  -- Default rate
    END IF;
    
    -- Validate student data
    IF NEW.role = 'student' AND NEW.learning_goals IS NULL THEN
        NEW.learning_goals := ARRAY[]::TEXT[];  -- Empty goals array
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_profile_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_student_booking"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = NEW.student_id AND role = 'student'
    ) THEN
        RAISE EXCEPTION 'Student ID must reference a profile with student role';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_student_booking"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_teacher_lesson"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = NEW.teacher_id AND role = 'teacher'
    ) THEN
        RAISE EXCEPTION 'Teacher ID must reference a profile with teacher role';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_teacher_lesson"() OWNER TO "postgres";


CREATE TEXT SEARCH CONFIGURATION "public"."latvian" (
    PARSER = "pg_catalog"."default" );

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "asciiword" WITH "english_stem";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "word" WITH "public"."unaccent", "english_stem";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "numword" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "email" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "url" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "host" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "sfloat" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "version" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "hword_numpart" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "hword_part" WITH "public"."unaccent", "english_stem";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "hword_asciipart" WITH "english_stem";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "numhword" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "asciihword" WITH "english_stem";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "hword" WITH "public"."unaccent", "english_stem";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "url_path" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "file" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "float" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "int" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."latvian"
    ADD MAPPING FOR "uint" WITH "simple";


ALTER TEXT SEARCH CONFIGURATION "public"."latvian" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "old_data" "jsonb",
    "new_data" "jsonb",
    "changed_by" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "student_id" character varying(255) NOT NULL,
    "schedule_id" "uuid" NOT NULL,
    "status" "public"."booking_status" DEFAULT 'pending'::"public"."booking_status" NOT NULL,
    "payment_status" "public"."payment_status" DEFAULT 'pending'::"public"."payment_status" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "bookings_amount_check" CHECK (("amount" >= (0)::numeric)),
    CONSTRAINT "valid_amount" CHECK (("amount" >= (0)::numeric))
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lesson_schedules" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "lesson_id" "uuid" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "is_available" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_schedule" CHECK (("end_time" > "start_time"))
);


ALTER TABLE "public"."lesson_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lessons" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "teacher_id" character varying(255) NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "duration" integer NOT NULL,
    "max_students" integer DEFAULT 1,
    "price" numeric(10,2) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_duration_positive" CHECK (("duration" > 0)),
    CONSTRAINT "check_price_positive" CHECK (("price" >= (0)::numeric)),
    CONSTRAINT "lessons_duration_check" CHECK (("duration" > 0)),
    CONSTRAINT "lessons_max_students_check" CHECK (("max_students" > 0)),
    CONSTRAINT "lessons_price_check" CHECK (("price" >= (0)::numeric))
);


ALTER TABLE "public"."lessons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "sender_id" character varying(255) NOT NULL,
    "content" "text" NOT NULL,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "messages_content_check" CHECK (("length"("content") > 0)),
    CONSTRAINT "valid_message_length" CHECK (("length"("content") > 0))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" character varying(255) NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "is_read" boolean DEFAULT false,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notifications_message_check" CHECK (("length"("message") > 0)),
    CONSTRAINT "notifications_title_check" CHECK (("length"("title") > 0))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_intents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "stripe_payment_intent_id" "text" NOT NULL,
    "booking_id" "uuid",
    "amount" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'EUR'::"text",
    "status" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payment_intents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" character varying(255) DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "text" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "role" "public"."user_role" DEFAULT 'student'::"public"."user_role" NOT NULL,
    "avatar_url" "text",
    "bio" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "hourly_rate" numeric(10,2),
    "learning_goals" "text"[],
    "phone" "text",
    "age" integer,
    "languages" "text"[] DEFAULT ARRAY[]::"text"[],
    "education_documents" "text"[] DEFAULT ARRAY[]::"text"[],
    "tax_id" "text",
    "personal_id" "text",
    "verification_status" "text" DEFAULT 'pending'::"text",
    "stripe_customer_id" "text",
    "stripe_account_id" "text",
    CONSTRAINT "check_hourly_rate" CHECK ((("hourly_rate" IS NULL) OR (("hourly_rate" >= (5)::numeric) AND ("hourly_rate" <= (200)::numeric)))),
    CONSTRAINT "profiles_id_length_check" CHECK (("length"(("id")::"text") >= 32)),
    CONSTRAINT "valid_age" CHECK (("age" >= 13)),
    CONSTRAINT "valid_email" CHECK (("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text")),
    CONSTRAINT "valid_metadata" CHECK (("jsonb_typeof"("metadata") = 'object'::"text")),
    CONSTRAINT "valid_phone" CHECK (("phone" ~ '^\+?[1-9]\d{1,14}$'::"text")),
    CONSTRAINT "valid_settings" CHECK (("jsonb_typeof"("settings") = 'object'::"text"))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "student_id" character varying(255) NOT NULL,
    "teacher_id" character varying(255) NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text",
    "is_public" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_rating_range" CHECK ((("rating" >= 1) AND ("rating" <= 5))),
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5))),
    CONSTRAINT "valid_review_length" CHECK (
CASE
    WHEN ("comment" IS NOT NULL) THEN ("length"("comment") >= 10)
    ELSE true
END)
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subjects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "icon_url" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "parent_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "category_id" "uuid",
    CONSTRAINT "valid_slug" CHECK (("slug" ~* '^[a-z0-9-]+$'::"text"))
);


ALTER TABLE "public"."subjects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teacher_subjects" (
    "teacher_id" character varying(255) NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "experience_years" integer DEFAULT 0,
    "hourly_rate" numeric(10,2),
    "is_verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "teacher_subjects_experience_years_check" CHECK (("experience_years" >= 0)),
    CONSTRAINT "teacher_subjects_hourly_rate_check" CHECK (("hourly_rate" >= (0)::numeric))
);


ALTER TABLE "public"."teacher_subjects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teacher_work_hours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "teacher_id" character varying(255) NOT NULL,
    "day_0" "text",
    "day_1" "text",
    "day_2" "text",
    "day_3" "text",
    "day_4" "text",
    "day_5" "text",
    "day_6" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."teacher_work_hours" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_profiles" AS
 SELECT "p"."id",
    "p"."user_id",
    "p"."email",
    "p"."full_name",
    "p"."role",
    "p"."avatar_url",
    "p"."bio",
    "p"."is_active",
    "p"."created_at",
    "p"."updated_at",
    "p"."metadata",
    "p"."settings",
    "p"."hourly_rate",
    "p"."learning_goals",
    "p"."phone",
    "p"."age",
    "p"."languages",
    "p"."education_documents",
    "p"."tax_id",
    "p"."personal_id",
    "p"."verification_status",
    "p"."stripe_customer_id",
    "p"."stripe_account_id",
        CASE
            WHEN ("p"."role" = 'teacher'::"public"."user_role") THEN "p"."bio"
            ELSE NULL::"text"
        END AS "teacher_bio",
        CASE
            WHEN ("p"."role" = 'teacher'::"public"."user_role") THEN "p"."hourly_rate"
            ELSE NULL::numeric
        END AS "teacher_rate",
        CASE
            WHEN ("p"."role" = 'student'::"public"."user_role") THEN "p"."learning_goals"
            ELSE NULL::"text"[]
        END AS "student_goals",
    "p"."role" AS "profile_type",
    "lower"("replace"("p"."full_name", ' '::"text", '-'::"text")) AS "url_slug",
        CASE
            WHEN ("p"."role" = 'teacher'::"public"."user_role") THEN "concat"("p"."full_name", ' - Pasniedzējs | MāciesTe')
            ELSE "concat"("p"."full_name", ' | MāciesTe')
        END AS "page_title"
   FROM "public"."profiles" "p";


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wallet_transactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "wallet_id" "uuid",
    "amount" numeric(10,2) NOT NULL,
    "type" "text",
    "status" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "wallet_transactions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text"]))),
    CONSTRAINT "wallet_transactions_type_check" CHECK (("type" = ANY (ARRAY['deposit'::"text", 'withdrawal'::"text", 'payment'::"text", 'refund'::"text", 'payout'::"text"])))
);


ALTER TABLE "public"."wallet_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wallets" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" character varying(255),
    "balance" numeric(10,2) DEFAULT 0.00,
    "currency" "text" DEFAULT 'EUR'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "positive_balance" CHECK (("balance" >= (0)::numeric))
);


ALTER TABLE "public"."wallets" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lesson_schedules"
    ADD CONSTRAINT "lesson_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lesson_schedules"
    ADD CONSTRAINT "no_schedule_overlap" UNIQUE NULLS NOT DISTINCT ("lesson_id", "start_time", "end_time");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "one_review_per_booking" UNIQUE ("booking_id");



ALTER TABLE ONLY "public"."payment_intents"
    ADD CONSTRAINT "payment_intents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_intents"
    ADD CONSTRAINT "payment_intents_stripe_payment_intent_id_key" UNIQUE ("stripe_payment_intent_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_slug_unique" UNIQUE ("slug");



ALTER TABLE ONLY "public"."teacher_subjects"
    ADD CONSTRAINT "teacher_subjects_pkey" PRIMARY KEY ("teacher_id", "subject_id");



ALTER TABLE ONLY "public"."teacher_work_hours"
    ADD CONSTRAINT "teacher_work_hours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "unique_student_schedule" UNIQUE ("student_id", "schedule_id");



ALTER TABLE ONLY "public"."wallet_transactions"
    ADD CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wallets"
    ADD CONSTRAINT "wallets_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_audit_log_changed_by" ON "public"."audit_log" USING "btree" ("changed_by");



CREATE INDEX "idx_audit_log_table_record" ON "public"."audit_log" USING "btree" ("table_name", "record_id");



CREATE INDEX "idx_bookings_composite" ON "public"."bookings" USING "btree" ("student_id", "schedule_id", "status");



CREATE INDEX "idx_bookings_schedule_id_status" ON "public"."bookings" USING "btree" ("schedule_id", "status");



CREATE INDEX "idx_bookings_schedule_status" ON "public"."bookings" USING "btree" ("schedule_id", "status");



CREATE INDEX "idx_bookings_status" ON "public"."bookings" USING "btree" ("status", "payment_status");



CREATE INDEX "idx_bookings_student" ON "public"."bookings" USING "btree" ("student_id");



CREATE INDEX "idx_bookings_student_id" ON "public"."bookings" USING "btree" ("student_id");



CREATE INDEX "idx_lesson_schedules_availability" ON "public"."lesson_schedules" USING "btree" ("lesson_id", "start_time", "is_available");



CREATE INDEX "idx_lesson_schedules_lesson_id" ON "public"."lesson_schedules" USING "btree" ("lesson_id");



CREATE INDEX "idx_lesson_schedules_time" ON "public"."lesson_schedules" USING "btree" ("start_time", "end_time");



CREATE INDEX "idx_lessons_composite" ON "public"."lessons" USING "btree" ("teacher_id", "subject_id", "is_active");



CREATE INDEX "idx_lessons_fts" ON "public"."lessons" USING "gin" ("to_tsvector"('"simple"'::"regconfig", ((COALESCE("title", ''::"text") || ' '::"text") || COALESCE("description", ''::"text"))));



CREATE INDEX "idx_lessons_is_active" ON "public"."lessons" USING "btree" ("is_active");



CREATE INDEX "idx_lessons_search" ON "public"."lessons" USING "gin" ("to_tsvector"('"english"'::"regconfig", (("title" || ' '::"text") || COALESCE("description", ''::"text"))));



CREATE INDEX "idx_lessons_subject" ON "public"."lessons" USING "btree" ("subject_id");



CREATE INDEX "idx_lessons_subject_id_is_active" ON "public"."lessons" USING "btree" ("subject_id", "is_active");



CREATE INDEX "idx_lessons_teacher" ON "public"."lessons" USING "btree" ("teacher_id");



CREATE INDEX "idx_lessons_teacher_active" ON "public"."lessons" USING "btree" ("teacher_id", "is_active");



CREATE INDEX "idx_lessons_teacher_id" ON "public"."lessons" USING "btree" ("teacher_id");



CREATE INDEX "idx_lessons_teacher_subject" ON "public"."lessons" USING "btree" ("teacher_id", "subject_id");



CREATE INDEX "idx_lessons_title_trgm" ON "public"."lessons" USING "gin" ("title" "public"."gin_trgm_ops");



CREATE INDEX "idx_messages_booking" ON "public"."messages" USING "btree" ("booking_id");



CREATE INDEX "idx_messages_created_at" ON "public"."messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_messages_sender" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "idx_messages_sender_id" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING "btree" ("user_id", "is_read");



CREATE INDEX "idx_notifications_user_read" ON "public"."notifications" USING "btree" ("user_id", "is_read");



CREATE INDEX "idx_notifications_user_type" ON "public"."notifications" USING "btree" ("user_id", "type");



CREATE INDEX "idx_payment_intents_status" ON "public"."payment_intents" USING "btree" ("status");



CREATE INDEX "idx_profiles_composite" ON "public"."profiles" USING "btree" ("user_id", "role", "is_active");



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_profiles_fts" ON "public"."profiles" USING "gin" ("to_tsvector"('"simple"'::"regconfig", ((COALESCE("full_name", ''::"text") || ' '::"text") || COALESCE("bio", ''::"text"))));



CREATE INDEX "idx_profiles_full_name" ON "public"."profiles" USING "btree" ("full_name");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_profiles_role_user_id" ON "public"."profiles" USING "btree" ("role", "user_id");



CREATE INDEX "idx_profiles_url_friendly_name" ON "public"."profiles" USING "btree" ("lower"("replace"("full_name", ' '::"text", '-'::"text")));



CREATE INDEX "idx_profiles_user_id" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_verification" ON "public"."profiles" USING "btree" ("verification_status") WHERE ("verification_status" = 'pending'::"text");



CREATE INDEX "idx_reviews_booking" ON "public"."reviews" USING "btree" ("booking_id");



CREATE INDEX "idx_reviews_student_id" ON "public"."reviews" USING "btree" ("student_id");



CREATE INDEX "idx_reviews_teacher_id" ON "public"."reviews" USING "btree" ("teacher_id");



CREATE INDEX "idx_subjects_category_id" ON "public"."subjects" USING "btree" ("category_id");



CREATE INDEX "idx_subjects_fts" ON "public"."subjects" USING "gin" ("to_tsvector"('"simple"'::"regconfig", ((COALESCE("name", ''::"text") || ' '::"text") || COALESCE("description", ''::"text"))));



CREATE INDEX "idx_subjects_name_trgm" ON "public"."subjects" USING "gin" ("name" "public"."gin_trgm_ops");



CREATE INDEX "idx_subjects_search" ON "public"."subjects" USING "gin" ("to_tsvector"('"english"'::"regconfig", (("name" || ' '::"text") || COALESCE("description", ''::"text"))));



CREATE INDEX "idx_subjects_slug" ON "public"."subjects" USING "btree" ("slug");



CREATE INDEX "idx_teacher_work_hours_teacher" ON "public"."teacher_work_hours" USING "btree" ("teacher_id");



CREATE INDEX "idx_teacher_work_hours_teacher_id" ON "public"."teacher_work_hours" USING "btree" ("teacher_id");



CREATE INDEX "idx_wallet_transactions_type" ON "public"."wallet_transactions" USING "btree" ("wallet_id", "type", "created_at");



CREATE OR REPLACE TRIGGER "ensure_profile_role" BEFORE INSERT OR UPDATE OF "role" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."validate_profile_role"();



CREATE OR REPLACE TRIGGER "ensure_student_role" BEFORE INSERT OR UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."validate_student_booking"();



CREATE OR REPLACE TRIGGER "ensure_teacher_role" BEFORE INSERT OR UPDATE ON "public"."lessons" FOR EACH ROW EXECUTE FUNCTION "public"."validate_teacher_lesson"();



CREATE OR REPLACE TRIGGER "ensure_valid_profile_id" BEFORE INSERT OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."validate_profile_id"();



CREATE OR REPLACE TRIGGER "profiles_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."log_profile_changes"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_subject_lesson_count_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."lessons" FOR EACH ROW EXECUTE FUNCTION "public"."update_subject_lesson_count"();



CREATE OR REPLACE TRIGGER "update_wallets_updated_at" BEFORE UPDATE ON "public"."wallets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."lesson_schedules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lesson_schedules"
    ADD CONSTRAINT "lesson_schedules_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."subjects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."teacher_subjects"
    ADD CONSTRAINT "teacher_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teacher_subjects"
    ADD CONSTRAINT "teacher_subjects_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teacher_work_hours"
    ADD CONSTRAINT "teacher_work_hours_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wallet_transactions"
    ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wallets"
    ADD CONSTRAINT "wallets_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Subjects are viewable by everyone" ON "public"."subjects" FOR SELECT USING (true);



ALTER TABLE "public"."audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lesson_schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lessons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_intents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subjects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teacher_subjects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teacher_work_hours" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "teacher_work_hours_insert_policy" ON "public"."teacher_work_hours" FOR INSERT WITH CHECK ((("teacher_id")::"text" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = (("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'sub'::"text")))));



CREATE POLICY "teacher_work_hours_select_policy" ON "public"."teacher_work_hours" FOR SELECT USING ((("teacher_id")::"text" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = (("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'sub'::"text")))));



CREATE POLICY "teacher_work_hours_update_policy" ON "public"."teacher_work_hours" FOR UPDATE USING ((("teacher_id")::"text" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = (("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'sub'::"text"))))) WITH CHECK ((("teacher_id")::"text" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = (("current_setting"('request.jwt.claims'::"text", true))::"jsonb" ->> 'sub'::"text")))));



ALTER TABLE "public"."wallet_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wallets" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


CREATE PUBLICATION "supabase_realtime_messages_publication" WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION "supabase_realtime_messages_publication" OWNER TO "supabase_admin";


ALTER PUBLICATION "supabase_realtime_messages_publication" ADD TABLE ONLY "public"."messages";



ALTER PUBLICATION "supabase_realtime_messages_publication" ADD TABLE ONLY "public"."notifications";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."check_table_exists"("table_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_table_exists"("table_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_work_hours_table"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_work_hours_table"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_lesson_counts_by_subject"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_lesson_counts_by_subject"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_lesson_counts_by_subject"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_teacher_availability"("teacher_id" "uuid", "start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_teacher_availability"("teacher_id" "uuid", "start_date" "date", "end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_teacher_lesson_count"("teacher_profile_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_teacher_lesson_count"("teacher_profile_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_teacher_lesson_count"("teacher_profile_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("required_role" "public"."user_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("required_role" "public"."user_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_teacher"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_teacher"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_profile_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_profile_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_profile_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_subject_lesson_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_subject_lesson_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_subject_lesson_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_booking_schedule"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_booking_schedule"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_profile_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_profile_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_profile_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_profile_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_profile_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_student_booking"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_student_booking"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_teacher_lesson"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_teacher_lesson"() TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";
GRANT SELECT ON TABLE "public"."categories" TO "anon";



GRANT ALL ON TABLE "public"."lesson_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."lesson_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."lessons" TO "authenticated";
GRANT ALL ON TABLE "public"."lessons" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."payment_intents" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_intents" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."subjects" TO "service_role";
GRANT SELECT ON TABLE "public"."subjects" TO "anon";



GRANT ALL ON TABLE "public"."teacher_subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."teacher_subjects" TO "service_role";



GRANT ALL ON TABLE "public"."teacher_work_hours" TO "authenticated";
GRANT ALL ON TABLE "public"."teacher_work_hours" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."wallet_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."wallet_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."wallets" TO "authenticated";
GRANT ALL ON TABLE "public"."wallets" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
