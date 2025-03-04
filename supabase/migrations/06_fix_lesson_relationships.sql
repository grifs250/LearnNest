-- Drop existing constraints if they exist
ALTER TABLE lessons 
  DROP CONSTRAINT IF EXISTS lessons_teacher_id_fkey;

-- Update lessons table to reference profiles instead of teacher_profiles
ALTER TABLE lessons
  ADD CONSTRAINT lessons_teacher_id_fkey 
  FOREIGN KEY (teacher_id) 
  REFERENCES profiles(id) ON DELETE CASCADE;

-- Add teacher role check
ALTER TABLE lessons
  ADD CONSTRAINT lessons_teacher_role_check
  CHECK (
    teacher_id IN (
      SELECT id FROM profiles 
      WHERE role = 'teacher'
    )
  );

-- Update lesson policies
DROP POLICY IF EXISTS "Teachers can manage their lessons" ON lessons;
DROP POLICY IF EXISTS "Anyone can view active lessons" ON lessons;

CREATE POLICY "Teachers can manage their lessons"
ON lessons
FOR ALL
USING (
  teacher_id IN (
    SELECT id FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    AND role = 'teacher'
  )
);

CREATE POLICY "Anyone can view active lessons"
ON lessons
FOR SELECT
USING (is_active = true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_role ON lessons(teacher_id)
WHERE EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = lessons.teacher_id 
  AND profiles.role = 'teacher'
);

-- Update bookings to reference profiles directly
ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_student_id_fkey;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_student_id_fkey
  FOREIGN KEY (student_id)
  REFERENCES profiles(id) ON DELETE CASCADE;

-- Add student role check
ALTER TABLE bookings
  ADD CONSTRAINT bookings_student_role_check
  CHECK (
    student_id IN (
      SELECT id FROM profiles 
      WHERE role = 'student'
    )
  );

-- Update booking policies
DROP POLICY IF EXISTS "Students can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Teachers can view bookings for their lessons" ON bookings;

CREATE POLICY "Students can view their bookings"
ON bookings
FOR SELECT
USING (
  student_id IN (
    SELECT id FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    AND role = 'student'
  )
);

CREATE POLICY "Teachers can view lesson bookings"
ON bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lesson_schedules ls
    JOIN lessons l ON l.id = ls.lesson_id
    WHERE ls.id = bookings.schedule_id
    AND l.teacher_id IN (
      SELECT id FROM profiles 
      WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
      AND role = 'teacher'
    )
  )
); 