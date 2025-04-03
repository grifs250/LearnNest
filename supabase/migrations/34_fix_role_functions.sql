-- Replace functions that might be causing role issues

-- Fix get_user_role function to handle missing roles properly
CREATE OR REPLACE FUNCTION public.get_user_role() RETURNS public.user_role
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    SELECT 
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM profiles 
          WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        ) THEN 
          (SELECT role FROM profiles 
           WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
           LIMIT 1)
        ELSE 'student'::user_role  -- Default to student if not found
      END;
$$;

-- Fix has_role function to handle errors properly
CREATE OR REPLACE FUNCTION public.has_role(required_role public.user_role) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        AND role = required_role
    );
EXCEPTION
    WHEN OTHERS THEN 
        RETURN FALSE;
END;
$$;

-- Fix is_teacher function to handle errors properly
CREATE OR REPLACE FUNCTION public.is_teacher() RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    AND role = 'teacher'
  );
EXCEPTION
    WHEN OTHERS THEN 
        RETURN FALSE;
END;
$$; 