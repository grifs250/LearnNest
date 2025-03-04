-- 1. Drop existing policies first
DO $$ 
BEGIN
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Anyone can view active lessons" ON lessons;
    DROP POLICY IF EXISTS "Teachers can manage their lessons" ON lessons;
    DROP POLICY IF EXISTS "Students can view their bookings" ON bookings;
    DROP POLICY IF EXISTS "Teachers can view their lesson bookings" ON bookings;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- 2. Update profiles table
DO $$ 
BEGIN
    ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS user_id TEXT UNIQUE,
        ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
        ADD COLUMN IF NOT EXISTS full_name TEXT,
        ADD COLUMN IF NOT EXISTS avatar_url TEXT,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('student', 'teacher')) DEFAULT 'student';
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 3. Create or replace indexes
DROP INDEX IF EXISTS idx_profiles_user_id;
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_lessons_teacher_id;
DROP INDEX IF EXISTS idx_bookings_student_id;

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_lessons_teacher_id ON lessons(teacher_id);
CREATE INDEX idx_bookings_student_id ON bookings(student_id);

-- 4. Create new policies
-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- Lessons policies
CREATE POLICY "Anyone can view active lessons"
ON lessons FOR SELECT
USING (is_active = true);

CREATE POLICY "Teachers can manage their lessons"
ON lessons FOR ALL
USING (
  teacher_id IN (
    SELECT id FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  )
);

-- Bookings policies
CREATE POLICY "Students can view their bookings"
ON bookings FOR SELECT
USING (
  student_id IN (
    SELECT id FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  )
);

CREATE POLICY "Teachers can view bookings for their lessons"
ON bookings FOR SELECT
USING (
  schedule_id IN (
    SELECT ls.id FROM lesson_schedules ls
    JOIN lessons l ON l.id = ls.lesson_id
    WHERE l.teacher_id IN (
      SELECT id FROM profiles 
      WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
  )
);

-- 5. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_schedules ENABLE ROW LEVEL SECURITY;

-- 6. Helper functions
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT user_id FROM profiles 
  WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    AND role = 'teacher'
  )
$$;

-- 7. Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
DROP TRIGGER IF EXISTS update_lesson_schedules_updated_at ON lesson_schedules;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_lesson_schedules_updated_at
    BEFORE UPDATE ON lesson_schedules
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column(); 