-- 1. Create proper types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Fix profiles table
ALTER TABLE profiles
    ALTER COLUMN role TYPE user_role USING role::user_role,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS learning_goals TEXT[];

-- Drop existing view if exists
DROP VIEW IF EXISTS user_profiles;

-- 3. Create unified view for user data
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    p.*,
    CASE 
        WHEN p.role = 'teacher' THEN p.bio
        ELSE NULL
    END as teacher_bio,
    CASE 
        WHEN p.role = 'teacher' THEN p.hourly_rate
        ELSE NULL
    END as teacher_rate,
    CASE 
        WHEN p.role = 'student' THEN p.learning_goals
        ELSE NULL
    END as student_goals,
    p.role as profile_type
FROM profiles p;

-- 4. Create helper functions
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
AS $$
    SELECT role FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    LIMIT 1;
$$;

-- 5. Create RLS helper function
CREATE OR REPLACE FUNCTION has_role(required_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        AND role = required_role
    );
$$;

-- 6. Update all policies to use new helpers
DROP POLICY IF EXISTS "Teachers can manage lessons" ON lessons;
CREATE POLICY "Teachers can manage lessons"
ON lessons
FOR ALL
USING (
    has_role('teacher'::user_role) AND
    teacher_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
);

-- 7. Add proper indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role_user_id ON profiles(role, user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_active ON lessons(teacher_id, is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_composite ON bookings(student_id, schedule_id, status);

-- 8. Create role validation triggers
CREATE OR REPLACE FUNCTION validate_teacher_lesson()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = NEW.teacher_id AND role = 'teacher'
    ) THEN
        RAISE EXCEPTION 'Teacher ID must reference a profile with teacher role';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_student_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = NEW.student_id AND role = 'student'
    ) THEN
        RAISE EXCEPTION 'Student ID must reference a profile with student role';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_teacher_role ON lessons;
CREATE TRIGGER ensure_teacher_role
    BEFORE INSERT OR UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION validate_teacher_lesson();

DROP TRIGGER IF EXISTS ensure_student_role ON bookings;
CREATE TRIGGER ensure_student_role
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION validate_student_booking();

-- 9. Add profile role validation function
CREATE OR REPLACE FUNCTION validate_profile_role()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- 10. Add profile validation trigger
DROP TRIGGER IF EXISTS ensure_profile_role ON profiles;
CREATE TRIGGER ensure_profile_role
    BEFORE INSERT OR UPDATE OF role ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_profile_role();

-- 11. Grant permissions
GRANT SELECT ON user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION has_role(user_role) TO authenticated; 