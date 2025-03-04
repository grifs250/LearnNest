-- Add indexes on foreign keys for better performance
CREATE INDEX IF NOT EXISTS idx_teacher_work_hours_teacher_id ON teacher_work_hours(teacher_id);
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_reviews_student_id ON reviews(student_id);
CREATE INDEX IF NOT EXISTS idx_reviews_teacher_id ON reviews(teacher_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Add user_id index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Add validation trigger to ensure profile IDs meet our format requirements
CREATE OR REPLACE FUNCTION validate_profile_id()
RETURNS TRIGGER AS $$
BEGIN
  IF LENGTH(NEW.id) < 32 THEN
    RAISE EXCEPTION 'Profile ID must be at least 32 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_valid_profile_id ON profiles;
CREATE TRIGGER ensure_valid_profile_id
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION validate_profile_id(); 