-- Drop existing policies first
DROP POLICY IF EXISTS "Students can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Students can manage own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;

-- Create new policies
CREATE POLICY "Students can create bookings" 
ON public.bookings FOR INSERT 
WITH CHECK (
  student_id IN (
    SELECT id FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  )
);

CREATE POLICY "Students can manage own reviews" 
ON public.reviews 
USING (
  student_id IN (
    SELECT id FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  )
);

CREATE POLICY "Users can manage own notifications" 
ON public.notifications 
USING (
  user_id IN (
    SELECT id FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  )
);

CREATE POLICY "Users can send messages" 
ON public.messages FOR INSERT 
WITH CHECK (
  sender_id IN (
    SELECT id FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  )
);

CREATE POLICY "Users can update own bookings" 
ON public.bookings FOR UPDATE 
USING (
  student_id IN (
    SELECT id FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  )
); 