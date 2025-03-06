-- Drop existing trigger first to avoid dependency errors
DROP TRIGGER IF EXISTS update_subject_lesson_count_trigger ON lessons;

-- Then drop the functions 
DROP FUNCTION IF EXISTS public.get_lesson_counts_by_subject();
DROP FUNCTION IF EXISTS public.update_subject_lesson_count();

-- Create the get_lesson_counts_by_subject function based on schema_full.sql
CREATE OR REPLACE FUNCTION public.get_lesson_counts_by_subject()
RETURNS TABLE (subject_id text, count bigint)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    l.subject_id,
    COUNT(l.id)::bigint AS count
  FROM 
    lessons l
  WHERE 
    l.is_active = true
  GROUP BY 
    l.subject_id;
$$;

-- Grant permissions to the function
GRANT EXECUTE ON FUNCTION public.get_lesson_counts_by_subject() TO authenticated, anon, service_role;

-- Create update_subject_lesson_count function based on schema_full.sql
CREATE OR REPLACE FUNCTION public.update_subject_lesson_count()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  affected_subject_id text;
  current_count bigint;
  current_metadata jsonb;
  updated_metadata jsonb;
BEGIN
  -- Get affected subject_id based on the operation
  IF (TG_OP = 'DELETE') THEN
    affected_subject_id := OLD.subject_id;
  ELSE
    affected_subject_id := NEW.subject_id;
  END IF;
  
  -- Get current count of active lessons for this subject
  SELECT COUNT(id)::bigint INTO current_count
  FROM lessons
  WHERE subject_id = affected_subject_id
  AND is_active = true;
  
  -- Get current metadata
  SELECT COALESCE(metadata, '{}'::jsonb) INTO current_metadata
  FROM subjects
  WHERE id = affected_subject_id;
  
  -- Update metadata with lesson count
  updated_metadata := jsonb_set(
    current_metadata, 
    '{lesson_count}', 
    to_jsonb(current_count)
  );
  
  -- Update the subject with new count
  UPDATE subjects
  SET 
    metadata = updated_metadata,
    updated_at = NOW()
  WHERE id = affected_subject_id;
  
  RETURN NULL;
END;
$$;

-- Create the trigger with the updated function
CREATE TRIGGER update_subject_lesson_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON lessons
FOR EACH ROW EXECUTE FUNCTION public.update_subject_lesson_count();

-- Run a one-time update to ensure all subjects have correct lesson counts
DO $$
DECLARE
  s record;
  lesson_count bigint;
  current_metadata jsonb;
  updated_metadata jsonb;
BEGIN
  FOR s IN SELECT id, metadata FROM subjects LOOP
    -- Count active lessons for this subject
    SELECT COUNT(id)::bigint INTO lesson_count
    FROM lessons
    WHERE subject_id = s.id AND is_active = true;
    
    -- Prepare updated metadata
    current_metadata := COALESCE(s.metadata, '{}'::jsonb);
    updated_metadata := jsonb_set(
      current_metadata, 
      '{lesson_count}', 
      to_jsonb(lesson_count)
    );
    
    -- Update the subject
    UPDATE subjects
    SET 
      metadata = updated_metadata,
      updated_at = NOW()
    WHERE id = s.id;
  END LOOP;
END;
$$; 