-- Create the teacher_work_hours table
CREATE TABLE IF NOT EXISTS public.teacher_work_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teachers can view their own work hours" ON public.teacher_work_hours;
DROP POLICY IF EXISTS "Teachers can update their own work hours" ON public.teacher_work_hours;
DROP POLICY IF EXISTS "teacher_work_hours_select_policy" ON public.teacher_work_hours;
DROP POLICY IF EXISTS "teacher_work_hours_insert_policy" ON public.teacher_work_hours;
DROP POLICY IF EXISTS "teacher_work_hours_update_policy" ON public.teacher_work_hours;

-- Create new RLS policies
CREATE POLICY "teacher_work_hours_select_policy"
  ON public.teacher_work_hours
  FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "teacher_work_hours_insert_policy"
  ON public.teacher_work_hours
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "teacher_work_hours_update_policy"
  ON public.teacher_work_hours
  FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Create function to check if table exists
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  );
END;
$$;

-- Create function to create work hours table
CREATE OR REPLACE FUNCTION public.create_work_hours_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'teacher_work_hours'
  ) THEN
    CREATE TABLE public.teacher_work_hours (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

    -- Create RLS policies
    CREATE POLICY "teacher_work_hours_select_policy"
      ON public.teacher_work_hours
      FOR SELECT
      USING (auth.uid() = teacher_id);

    CREATE POLICY "teacher_work_hours_insert_policy"
      ON public.teacher_work_hours
      FOR INSERT
      WITH CHECK (auth.uid() = teacher_id);

    CREATE POLICY "teacher_work_hours_update_policy"
      ON public.teacher_work_hours
      FOR UPDATE
      USING (auth.uid() = teacher_id)
      WITH CHECK (auth.uid() = teacher_id);
  END IF;
END;
$$; 