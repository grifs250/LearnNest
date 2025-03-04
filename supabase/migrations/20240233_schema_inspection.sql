-- This will help us understand the actual structure of the tables
DO $$ 
DECLARE
    column_info RECORD;
BEGIN
    RAISE NOTICE 'Inspecting bookings table:';
    FOR column_info IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: %, Type: %', column_info.column_name, column_info.data_type;
    END LOOP;
    
    RAISE NOTICE 'Inspecting lessons table:';
    FOR column_info IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'lessons' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: %, Type: %', column_info.column_name, column_info.data_type;
    END LOOP;
    
    RAISE NOTICE 'Inspecting lesson_schedules table:';
    FOR column_info IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'lesson_schedules' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: %, Type: %', column_info.column_name, column_info.data_type;
    END LOOP;
END $$;

-- Now let's create a function that will work with whatever schema we actually have
CREATE OR REPLACE FUNCTION get_teacher_lesson_count(teacher_profile_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    count_result INTEGER;
BEGIN
    -- Try different approaches based on the schema
    -- If schedule_id exists in bookings
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'schedule_id'
    ) THEN
        SELECT COUNT(*) INTO count_result
        FROM bookings b
        JOIN lesson_schedules ls ON b.schedule_id = ls.id
        JOIN lessons l ON ls.lesson_id = l.id
        WHERE l.teacher_id = teacher_profile_id AND b.status = 'completed';
        
        RETURN count_result;
    -- If lesson_id exists in bookings
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'lesson_id'
    ) THEN
        SELECT COUNT(*) INTO count_result
        FROM bookings b
        JOIN lessons l ON b.lesson_id = l.id
        WHERE l.teacher_id = teacher_profile_id AND b.status = 'completed';
        
        RETURN count_result;
    -- If teacher_id exists in bookings
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'teacher_id'
    ) THEN
        SELECT COUNT(*) INTO count_result
        FROM bookings
        WHERE teacher_id = teacher_profile_id AND status = 'completed';
        
        RETURN count_result;
    ELSE
        -- Fallback: return 0 if we can't determine the schema
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_teacher_lesson_count(TEXT) TO authenticated; 