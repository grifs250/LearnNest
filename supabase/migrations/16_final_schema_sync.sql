-- 1. Wrap in transaction
BEGIN;

-- 2. Fix remaining auth.uid() references in policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
    DROP POLICY IF EXISTS "Teachers can manage own lessons" ON lessons;
    DROP POLICY IF EXISTS "Teachers can manage own lesson schedules" ON lesson_schedules;
    DROP POLICY IF EXISTS "Users can view own messages" ON messages;
    DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 3. Create updated policies using Clerk JWT
CREATE POLICY "Users can view own bookings" ON bookings
FOR SELECT USING (
    student_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
    OR 
    EXISTS (
        SELECT 1 FROM lesson_schedules ls
        JOIN lessons l ON l.id = ls.lesson_id
        WHERE ls.id = bookings.schedule_id
        AND l.teacher_id IN (
            SELECT id FROM profiles 
            WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        )
    )
);

CREATE POLICY "Teachers can manage own lessons" ON lessons
FOR ALL USING (
    teacher_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        AND role = 'teacher'
    )
);

CREATE POLICY "Teachers can manage own lesson schedules" ON lesson_schedules
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM lessons l
        WHERE l.id = lesson_schedules.lesson_id
        AND l.teacher_id IN (
            SELECT id FROM profiles 
            WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
            AND role = 'teacher'
        )
    )
);

-- 4. Fix realtime publication
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime_messages_publication 
    ADD TABLE messages, notifications;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Add missing function grants
DO $$ BEGIN
    GRANT EXECUTE ON FUNCTION get_teacher_availability(UUID, DATE, DATE) TO authenticated;
    GRANT EXECUTE ON FUNCTION validate_booking_schedule() TO authenticated;
    GRANT EXECUTE ON FUNCTION validate_profile_role() TO authenticated;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Fix function security
ALTER FUNCTION get_teacher_availability(UUID, DATE, DATE) 
    SECURITY DEFINER
    SET search_path = public;

ALTER FUNCTION validate_booking_schedule() 
    SECURITY DEFINER
    SET search_path = public;

ALTER FUNCTION validate_profile_role() 
    SECURITY DEFINER
    SET search_path = public;

-- 7. Add missing indexes for performance
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_lessons_teacher_subject 
    ON lessons(teacher_id, subject_id);

    CREATE INDEX IF NOT EXISTS idx_bookings_schedule_status 
    ON bookings(schedule_id, status);

    CREATE INDEX IF NOT EXISTS idx_notifications_user_type 
    ON notifications(user_id, type);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMIT; 