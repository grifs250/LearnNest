-- 1. Wrap in transaction
BEGIN;

-- 2. Fix remaining auth.uid() references in policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Teachers can manage own subjects" ON teacher_subjects;
    DROP POLICY IF EXISTS "Students can create bookings" ON bookings;
    DROP POLICY IF EXISTS "Students can manage own reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can send messages" ON messages;
    DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 3. Create updated policies using Clerk JWT
CREATE POLICY "Teachers can manage own subjects" ON teacher_subjects
FOR ALL USING (
    teacher_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        AND role = 'teacher'
    )
);

CREATE POLICY "Students can create bookings" ON bookings
FOR INSERT WITH CHECK (
    student_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        AND role = 'student'
    )
);

CREATE POLICY "Students can manage own reviews" ON reviews
FOR ALL USING (
    student_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
);

CREATE POLICY "Users can send messages" ON messages
FOR INSERT WITH CHECK (
    sender_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
);

CREATE POLICY "Users can update own bookings" ON bookings
FOR UPDATE USING (
    student_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
);

-- 4. Add missing policies
CREATE POLICY "Users can view own messages" ON messages
FOR SELECT USING (
    sender_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
    OR 
    EXISTS (
        SELECT 1 FROM bookings b
        JOIN lesson_schedules ls ON ls.id = b.schedule_id
        JOIN lessons l ON l.id = ls.lesson_id
        WHERE b.id = messages.booking_id
        AND (
            b.student_id IN (
                SELECT id FROM profiles 
                WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
            )
            OR 
            l.teacher_id IN (
                SELECT id FROM profiles 
                WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
            )
        )
    )
);

CREATE POLICY "Users can view own notifications" ON notifications
FOR SELECT USING (
    user_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
);

-- 5. Add missing function security
ALTER FUNCTION validate_student_booking() 
    SECURITY DEFINER
    SET search_path = public;

ALTER FUNCTION validate_teacher_lesson() 
    SECURITY DEFINER
    SET search_path = public;

-- 6. Add missing RLS enables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;

COMMIT; 