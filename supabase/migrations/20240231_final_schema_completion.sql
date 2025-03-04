-- First ensure the audit_log table exists
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for better query performance on audit logs
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by ON audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Make the RLS trigger work with NULL values
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name, 
    record_id, 
    action, 
    old_data, 
    new_data, 
    changed_by
  ) VALUES (
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    TG_OP,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW) END,
    NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'sub'
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- Add missing functions for profile URL slugs
CREATE OR REPLACE FUNCTION get_profile_url_slug(full_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(full_name, '[^a-zA-Z0-9]', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Add function to get total lessons completed for a teacher
CREATE OR REPLACE FUNCTION get_teacher_lesson_count(teacher_id TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM bookings 
    WHERE teacher_id = $1 AND status = 'completed'
  );
END;
$$ LANGUAGE plpgsql;

-- Performance: Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_bookings_student_status ON bookings(student_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_teacher_status ON bookings(teacher_id, status);
CREATE INDEX IF NOT EXISTS idx_lessons_category_subject ON lessons(category_id, subject_id);

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION get_profile_url_slug(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_teacher_lesson_count(TEXT) TO authenticated;
GRANT SELECT ON audit_log TO service_role; 