-- Final correct function for counting teacher lessons
CREATE OR REPLACE FUNCTION get_teacher_lesson_count(teacher_profile_id TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM bookings b
    JOIN lesson_schedules ls ON b.schedule_id = ls.id
    JOIN lessons l ON ls.lesson_id = l.id
    WHERE l.teacher_id = teacher_profile_id AND b.status = 'completed'
  );
END;
$$ LANGUAGE plpgsql;

-- Ensure we have all the necessary indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_schedule_id_status ON bookings(schedule_id, status);
CREATE INDEX IF NOT EXISTS idx_lesson_schedules_lesson_id ON lesson_schedules(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id ON lessons(teacher_id);

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_teacher_lesson_count(TEXT) TO authenticated; 