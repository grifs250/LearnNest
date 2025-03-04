-- 1. Wrap in transaction
BEGIN;

-- 2. Fix remaining auth.users references
DO $$ BEGIN
    ALTER TABLE teacher_work_hours
        DROP CONSTRAINT IF EXISTS teacher_work_hours_teacher_id_fkey_old;
    
    ALTER TABLE teacher_work_hours
        DROP CONSTRAINT IF EXISTS teacher_work_hours_teacher_id_fkey;
        
    ALTER TABLE teacher_work_hours
        ADD CONSTRAINT teacher_work_hours_teacher_id_fkey 
        FOREIGN KEY (teacher_id) 
        REFERENCES profiles(id) ON DELETE CASCADE;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 3. Fix function security and search paths
DO $$ BEGIN
    ALTER FUNCTION get_current_user_id() OWNER TO postgres;
    ALTER FUNCTION get_user_role() OWNER TO postgres;
    ALTER FUNCTION has_role(user_role) OWNER TO postgres;
    ALTER FUNCTION is_teacher() OWNER TO postgres;
    ALTER FUNCTION validate_booking_schedule() OWNER TO postgres;
    ALTER FUNCTION validate_profile_role() OWNER TO postgres;
    ALTER FUNCTION validate_student_booking() OWNER TO postgres;
    ALTER FUNCTION validate_teacher_lesson() OWNER TO postgres;
    ALTER FUNCTION update_updated_at_column() OWNER TO postgres;
    ALTER FUNCTION create_work_hours_table() OWNER TO postgres;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 4. Fix remaining RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
    DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Users can manage own profiles"
ON profiles
FOR ALL
USING (
    user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- 5. Fix remaining permissions
DO $$ BEGIN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
    
    GRANT SELECT ON TABLE categories, subjects TO anon;
    GRANT USAGE ON SCHEMA public TO anon;
EXCEPTION
    WHEN invalid_grant_operation THEN null;
END $$;

-- 6. Add missing indexes
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_profiles_composite 
    ON profiles(user_id, role, is_active);
    
    CREATE INDEX IF NOT EXISTS idx_lessons_composite 
    ON lessons(teacher_id, subject_id, is_active);
    
    CREATE INDEX IF NOT EXISTS idx_bookings_composite 
    ON bookings(student_id, schedule_id, status, payment_status);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. Add missing constraints
DO $$ BEGIN
    ALTER TABLE profiles
        ADD CONSTRAINT valid_metadata CHECK (jsonb_typeof(metadata) = 'object'),
        ADD CONSTRAINT valid_settings CHECK (jsonb_typeof(settings) = 'object');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMIT; 