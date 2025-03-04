-- Fix the get_teacher_lesson_count function to use proper table relationships
CREATE OR REPLACE FUNCTION get_teacher_lesson_count(teacher_id TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM bookings b
    JOIN lessons l ON b.lesson_id = l.id
    WHERE l.teacher_id = $1 AND b.status = 'completed'
  );
END;
$$ LANGUAGE plpgsql;

-- Make sure bookings has the necessary indexes for the join
CREATE INDEX IF NOT EXISTS idx_bookings_lesson_id ON bookings(lesson_id); 