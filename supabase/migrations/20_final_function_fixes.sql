-- 1. Wrap in transaction
BEGIN;

-- 2. Fix create_work_hours_table function
CREATE OR REPLACE FUNCTION create_work_hours_table()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'teacher_work_hours'
  ) THEN
    CREATE TABLE public.teacher_work_hours (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      day_0 TEXT, -- Sunday
      day_1 TEXT, -- Monday
      day_2 TEXT, -- Tuesday
      day_3 TEXT, -- Wednesday
      day_4 TEXT, -- Thursday
      day_5 TEXT, -- Friday
      day_6 TEXT, -- Saturday
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE public.teacher_work_hours ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies using Clerk JWT
    CREATE POLICY "teacher_work_hours_select_policy"
      ON public.teacher_work_hours
      FOR SELECT
      USING (
        teacher_id IN (
          SELECT id FROM profiles 
          WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        )
      );

    CREATE POLICY "teacher_work_hours_insert_policy"
      ON public.teacher_work_hours
      FOR INSERT
      WITH CHECK (
        teacher_id IN (
          SELECT id FROM profiles 
          WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        )
      );

    CREATE POLICY "teacher_work_hours_update_policy"
      ON public.teacher_work_hours
      FOR UPDATE
      USING (
        teacher_id IN (
          SELECT id FROM profiles 
          WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        )
      )
      WITH CHECK (
        teacher_id IN (
          SELECT id FROM profiles 
          WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        )
      );
  END IF;
END;
$$;

-- 3. Fix function security
ALTER FUNCTION create_work_hours_table() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION create_work_hours_table() TO authenticated;

-- 4. Fix remaining function security
DO $$ BEGIN
    ALTER FUNCTION get_user_role() 
        SECURITY DEFINER
        SET search_path = public;

    ALTER FUNCTION has_role(user_role) 
        SECURITY DEFINER
        SET search_path = public;

    ALTER FUNCTION is_teacher() 
        SECURITY DEFINER
        SET search_path = public;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

COMMIT; 