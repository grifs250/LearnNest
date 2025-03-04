-- Fix teacher_work_hours table
ALTER TABLE public.teacher_work_hours 
  DROP CONSTRAINT IF EXISTS teacher_work_hours_teacher_id_fkey;

-- Update the reference to use profiles instead of auth.users
ALTER TABLE public.teacher_work_hours
  ADD CONSTRAINT teacher_work_hours_teacher_id_fkey 
  FOREIGN KEY (teacher_id) 
  REFERENCES public.profiles(id);

-- Update work hours policies to use Clerk JWT
DROP POLICY IF EXISTS "teacher_work_hours_select_policy" ON public.teacher_work_hours;
DROP POLICY IF EXISTS "teacher_work_hours_insert_policy" ON public.teacher_work_hours;
DROP POLICY IF EXISTS "teacher_work_hours_update_policy" ON public.teacher_work_hours;

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