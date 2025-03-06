-- Create a function to get lesson counts by subject
CREATE OR REPLACE FUNCTION public.get_lesson_counts_by_subject()
RETURNS TABLE (
  subject_id uuid,
  count text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Log query execution for debugging
  -- Note: Add proper logging in production
  
  SELECT 
    subject_id,
    COUNT(*)::text AS count
  FROM lessons
  WHERE is_active = true
  GROUP BY subject_id;
$$;

-- Set proper permissions for the function
GRANT EXECUTE ON FUNCTION public.get_lesson_counts_by_subject() TO anon, authenticated;

-- Create a table trigger function to maintain lesson counts in subjects table
CREATE OR REPLACE FUNCTION public.update_subject_lesson_count() 
RETURNS TRIGGER AS $$
BEGIN
  -- Update the lesson_count in the metadata field for the subject
  UPDATE subjects
  SET metadata = 
    CASE 
      WHEN metadata IS NULL THEN jsonb_build_object('lesson_count', (
        SELECT COUNT(*) FROM lessons 
        WHERE subject_id = NEW.subject_id 
        AND is_active = true
      ))
      ELSE metadata || jsonb_build_object('lesson_count', (
        SELECT COUNT(*) FROM lessons 
        WHERE subject_id = NEW.subject_id 
        AND is_active = true
      ))
    END
  WHERE id = NEW.subject_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update lesson counts when lessons are added/modified/deleted
CREATE TRIGGER update_subject_lesson_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON lessons
FOR EACH ROW EXECUTE FUNCTION public.update_subject_lesson_count();