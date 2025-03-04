-- 1. Fix auth.uid() references in policies
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings" ON bookings
FOR SELECT USING (
    student_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
    OR 
    EXISTS (
        SELECT 1 FROM lesson_schedules ls
        JOIN lessons l ON l.id = ls.lesson_id
        JOIN profiles p ON p.id = l.teacher_id
        WHERE ls.id = bookings.schedule_id
        AND p.user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
);

-- 2. Fix create_work_hours_table function
CREATE OR REPLACE FUNCTION create_work_hours_table()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
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
  END IF;
END;
$$;

-- 3. Add missing RLS policies for messages
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages
FOR SELECT USING (
    sender_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
    OR 
    EXISTS (
        SELECT 1 FROM bookings b
        JOIN lesson_schedules ls ON ls.id = b.schedule_id
        JOIN lessons l ON l.id = ls.lesson_id
        JOIN profiles p ON (p.id = b.student_id OR p.id = l.teacher_id)
        WHERE b.id = messages.booking_id
        AND p.user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
);

-- 4. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_booking_created 
ON messages(booking_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_teacher_rating 
ON reviews(teacher_id, rating);

CREATE INDEX IF NOT EXISTS idx_lessons_price_active 
ON lessons(price) WHERE is_active = true;

-- 5. Add missing constraints
DO $$ BEGIN
    ALTER TABLE messages
        ADD CONSTRAINT valid_message_length 
        CHECK (length(content) > 0);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE reviews
        ADD CONSTRAINT valid_review_length 
        CHECK (
            CASE 
                WHEN comment IS NOT NULL THEN length(comment) >= 10
                ELSE true
            END
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Update realtime publication
ALTER PUBLICATION supabase_realtime_messages_publication 
ADD TABLE messages, notifications;

-- 7. Add helpful functions
CREATE OR REPLACE FUNCTION get_teacher_stats(teacher_profile_id UUID)
RETURNS TABLE (
    total_lessons INT,
    avg_rating DECIMAL(3,2),
    completed_bookings INT,
    total_earnings DECIMAL(10,2)
) LANGUAGE plpgsql STABLE AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT l.id)::INT as total_lessons,
        COALESCE(AVG(r.rating), 0)::DECIMAL(3,2) as avg_rating,
        COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed')::INT as completed_bookings,
        COALESCE(SUM(wt.amount) FILTER (WHERE wt.status = 'completed'), 0) as total_earnings
    FROM profiles p
    LEFT JOIN lessons l ON l.teacher_id = p.id
    LEFT JOIN lesson_schedules ls ON ls.lesson_id = l.id
    LEFT JOIN bookings b ON b.schedule_id = ls.id
    LEFT JOIN reviews r ON r.teacher_id = p.id
    LEFT JOIN wallets w ON w.profile_id = p.id
    LEFT JOIN wallet_transactions wt ON wt.wallet_id = w.id
    WHERE p.id = teacher_profile_id
    AND p.role = 'teacher';
END;
$$;

-- 8. Grant permissions
GRANT EXECUTE ON FUNCTION get_teacher_stats TO authenticated; 