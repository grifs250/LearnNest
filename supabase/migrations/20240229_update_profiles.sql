-- First, drop the view that depends on profiles.id
DROP VIEW IF EXISTS user_profiles;

-- First, drop ALL policies that depend on profiles.id directly or indirectly
-- Drop in reverse dependency order

-- Drop booking-related policies
DROP POLICY IF EXISTS "Students can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete own bookings" ON bookings;

-- Drop message policies
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;

-- Drop review policies
DROP POLICY IF EXISTS "Students can manage own reviews" ON reviews;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;

-- Drop notification policies
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;

-- Drop wallet policies
DROP POLICY IF EXISTS "Users can manage wallet transactions" ON wallet_transactions;

-- Drop lesson-related policies
DROP POLICY IF EXISTS "Teachers can manage lessons" ON lessons;
DROP POLICY IF EXISTS "Teachers can manage own lessons" ON lessons;
DROP POLICY IF EXISTS "Teachers can view own lessons" ON lessons;
DROP POLICY IF EXISTS "Teachers can view lessons" ON lessons;
DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON lessons;
DROP POLICY IF EXISTS lessons_select_policy ON lessons;
DROP POLICY IF EXISTS lessons_update_policy ON lessons;
DROP POLICY IF EXISTS lessons_delete_policy ON lessons;
DROP POLICY IF EXISTS lessons_insert_policy ON lessons;

-- Drop lesson schedules policies
DROP POLICY IF EXISTS "Teachers can manage own lesson schedules" ON lesson_schedules;
DROP POLICY IF EXISTS "Students can view booked schedules" ON lesson_schedules;
DROP POLICY IF EXISTS "Lesson schedules are viewable by everyone" ON lesson_schedules;
DROP POLICY IF EXISTS lesson_schedules_select_policy ON lesson_schedules;
DROP POLICY IF EXISTS lesson_schedules_update_policy ON lesson_schedules;
DROP POLICY IF EXISTS lesson_schedules_delete_policy ON lesson_schedules;
DROP POLICY IF EXISTS lesson_schedules_insert_policy ON lesson_schedules;

-- Drop teacher subjects policies
DROP POLICY IF EXISTS "Teachers can manage own subjects" ON teacher_subjects;
DROP POLICY IF EXISTS "Teachers can view own subjects" ON teacher_subjects;
DROP POLICY IF EXISTS "Teacher subjects are viewable by everyone" ON teacher_subjects;
DROP POLICY IF EXISTS teacher_subjects_select_policy ON teacher_subjects;
DROP POLICY IF EXISTS teacher_subjects_update_policy ON teacher_subjects;
DROP POLICY IF EXISTS teacher_subjects_delete_policy ON teacher_subjects;
DROP POLICY IF EXISTS teacher_subjects_insert_policy ON teacher_subjects;

-- Drop teacher work hours policies first (using exact names from schema)
DROP POLICY IF EXISTS "teacher_work_hours_select_policy" ON teacher_work_hours;
DROP POLICY IF EXISTS "teacher_work_hours_insert_policy" ON teacher_work_hours;
DROP POLICY IF EXISTS "teacher_work_hours_update_policy" ON teacher_work_hours;

-- Drop audit log policies
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_log;

-- Drop profiles policies last
DROP POLICY IF EXISTS "Users can manage own profiles" ON profiles;
DROP POLICY IF EXISTS profiles_select_policy ON profiles;
DROP POLICY IF EXISTS profiles_update_policy ON profiles;
DROP POLICY IF EXISTS profiles_delete_policy ON profiles;
DROP POLICY IF EXISTS profiles_insert_policy ON profiles;

-- Drop all foreign key constraints that reference profiles.id
ALTER TABLE teacher_work_hours DROP CONSTRAINT IF EXISTS teacher_work_hours_teacher_id_fkey;
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_teacher_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_student_id_fkey;
ALTER TABLE teacher_subjects DROP CONSTRAINT IF EXISTS teacher_subjects_teacher_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_profile_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_student_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_teacher_id_fkey;

-- Now we can alter the column
ALTER TABLE profiles
ALTER COLUMN id TYPE varchar(255);

-- Also update all foreign key columns that reference profiles.id
ALTER TABLE teacher_work_hours ALTER COLUMN teacher_id TYPE varchar(255);
ALTER TABLE lessons ALTER COLUMN teacher_id TYPE varchar(255);
ALTER TABLE bookings ALTER COLUMN student_id TYPE varchar(255);
ALTER TABLE teacher_subjects ALTER COLUMN teacher_id TYPE varchar(255);
ALTER TABLE notifications ALTER COLUMN user_id TYPE varchar(255);
ALTER TABLE wallets ALTER COLUMN profile_id TYPE varchar(255);
ALTER TABLE messages ALTER COLUMN sender_id TYPE varchar(255);
ALTER TABLE reviews ALTER COLUMN student_id TYPE varchar(255);
ALTER TABLE reviews ALTER COLUMN teacher_id TYPE varchar(255);

-- Add a check constraint to ensure minimum length
ALTER TABLE profiles
ADD CONSTRAINT profiles_id_length_check
CHECK (length(id) >= 32);

-- Recreate the view
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.email,
  p.full_name,
  p.role,
  p.avatar_url,
  p.bio,
  p.is_active,
  p.created_at,
  p.updated_at,
  p.metadata,
  p.settings,
  p.hourly_rate,
  p.learning_goals,
  p.phone,
  p.age,
  p.languages,
  p.education_documents,
  p.tax_id,
  p.personal_id,
  p.verification_status,
  p.stripe_customer_id,
  p.stripe_account_id,
  CASE
    WHEN p.role = 'teacher' THEN p.bio
    ELSE NULL
  END AS teacher_bio,
  CASE
    WHEN p.role = 'teacher' THEN p.hourly_rate
    ELSE NULL
  END AS teacher_rate,
  CASE
    WHEN p.role = 'student' THEN p.learning_goals
    ELSE NULL
  END AS student_goals,
  p.role AS profile_type
FROM profiles p;

-- Recreate ALL policies in the correct order
CREATE POLICY "teacher_work_hours_select_policy" 
ON teacher_work_hours 
FOR SELECT 
USING (
  teacher_id IN (
    SELECT id FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  )
);

CREATE POLICY "teacher_work_hours_insert_policy" 
ON teacher_work_hours 
FOR INSERT 
WITH CHECK (
  teacher_id IN (
    SELECT id FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  )
);

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

-- Recreate foreign key constraints
ALTER TABLE teacher_work_hours
ADD CONSTRAINT teacher_work_hours_teacher_id_fkey
FOREIGN KEY (teacher_id) REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE lessons
ADD CONSTRAINT lessons_teacher_id_fkey
FOREIGN KEY (teacher_id) REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE bookings
ADD CONSTRAINT bookings_student_id_fkey
FOREIGN KEY (student_id) REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE teacher_subjects
ADD CONSTRAINT teacher_subjects_teacher_id_fkey
FOREIGN KEY (teacher_id) REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE notifications
ADD CONSTRAINT notifications_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE wallets
ADD CONSTRAINT wallets_profile_id_fkey
FOREIGN KEY (profile_id) REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE messages
ADD CONSTRAINT messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE reviews
ADD CONSTRAINT reviews_student_id_fkey
FOREIGN KEY (student_id) REFERENCES profiles(id)
ON DELETE CASCADE,
ADD CONSTRAINT reviews_teacher_id_fkey
FOREIGN KEY (teacher_id) REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add lesson schedules foreign key
ALTER TABLE lesson_schedules
DROP CONSTRAINT IF EXISTS lesson_schedules_lesson_id_fkey,
ADD CONSTRAINT lesson_schedules_lesson_id_fkey
FOREIGN KEY (lesson_id) REFERENCES lessons(id)
ON DELETE CASCADE; 