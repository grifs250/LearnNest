-- 1. Wrap all operations in a transaction
BEGIN;

-- 2. Fix auth.users references to use profiles safely
DO $$ BEGIN
    ALTER TABLE public.teacher_work_hours 
        DROP CONSTRAINT IF EXISTS teacher_work_hours_teacher_id_fkey;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

ALTER TABLE public.teacher_work_hours
    ADD CONSTRAINT teacher_work_hours_teacher_id_fkey 
    FOREIGN KEY (teacher_id) 
    REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. Fix functions safely
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS text
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT user_id FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    LIMIT 1;
$$;

-- 4. Fix RLS policies safely
DO $$ BEGIN
    DROP POLICY IF EXISTS "teacher_work_hours_select_policy" ON teacher_work_hours;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "teacher_work_hours_select_policy"
ON teacher_work_hours
FOR SELECT
USING (
    teacher_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
);

-- 5. Add RLS policies safely
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_log;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Users can view own audit logs"
ON audit_log
FOR SELECT
USING (
    changed_by = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- 6. Fix permissions safely
DO $$ BEGIN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
EXCEPTION
    WHEN invalid_grant_operation THEN null;
END $$;

-- 7. Grant permissions safely
DO $$ BEGIN
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 8. Add indexes safely
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by ON audit_log(changed_by);
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    CREATE INDEX IF NOT EXISTS idx_profiles_verification ON profiles(verification_status) 
    WHERE verification_status = 'pending';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 9. Add constraints safely
DO $$ BEGIN
    ALTER TABLE profiles
        ADD CONSTRAINT valid_email 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 10. Clean up safely
DO $$ BEGIN
    DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 11. Update owners safely
DO $$ BEGIN
    ALTER FUNCTION get_current_user_id() OWNER TO postgres;
    ALTER FUNCTION get_user_role() OWNER TO postgres;
    ALTER FUNCTION has_role(user_role) OWNER TO postgres;
    ALTER FUNCTION is_teacher() OWNER TO postgres;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 12. Grant execute to authenticated
DO $$ BEGIN
    GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated;
    GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
    GRANT EXECUTE ON FUNCTION has_role(user_role) TO authenticated;
    GRANT EXECUTE ON FUNCTION is_teacher() TO authenticated;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMIT; 