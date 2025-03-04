-- 1. Drop the view first
DROP VIEW IF EXISTS user_profiles;

-- 2. Fix teacher_work_hours references
ALTER TABLE public.teacher_work_hours 
    DROP CONSTRAINT IF EXISTS teacher_work_hours_teacher_id_fkey;

ALTER TABLE public.teacher_work_hours
    ADD CONSTRAINT teacher_work_hours_teacher_id_fkey 
    FOREIGN KEY (teacher_id) 
    REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. Add missing columns to profiles
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS age INTEGER,
    ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS education_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS tax_id TEXT,
    ADD COLUMN IF NOT EXISTS personal_id TEXT,
    ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
    ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
    ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS learning_goals TEXT[],
    ADD COLUMN IF NOT EXISTS bio TEXT;

-- 4. Fix RLS policies to use Clerk JWT
DROP POLICY IF EXISTS "teacher_work_hours_select_policy" ON teacher_work_hours;
CREATE POLICY "teacher_work_hours_select_policy"
ON teacher_work_hours
FOR SELECT
USING (
    teacher_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
);

DROP POLICY IF EXISTS "teacher_work_hours_insert_policy" ON teacher_work_hours;
CREATE POLICY "teacher_work_hours_insert_policy"
ON teacher_work_hours
FOR INSERT
WITH CHECK (
    teacher_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
);

DROP POLICY IF EXISTS "teacher_work_hours_update_policy" ON teacher_work_hours;
CREATE POLICY "teacher_work_hours_update_policy"
ON teacher_work_hours
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

-- 5. Add missing indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_teacher_work_hours_teacher ON teacher_work_hours(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_bookings_student ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- 6. Add proper constraints
DO $$ BEGIN
    ALTER TABLE profiles
        ADD CONSTRAINT valid_phone CHECK (phone ~ '^\+?[1-9]\d{1,14}$');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE profiles
        ADD CONSTRAINT valid_age CHECK (age >= 13);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE bookings
        ADD CONSTRAINT valid_amount CHECK (amount >= 0);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. Clean up unused tables
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS teacher_profiles CASCADE;

-- 8. Recreate the view with all columns
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

-- 9. Grant proper permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated; 