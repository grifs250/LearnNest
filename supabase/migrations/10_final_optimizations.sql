-- 1. Create audit log table that was missing
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add missing wallet policies
DROP POLICY IF EXISTS "Users can manage wallet transactions" ON wallet_transactions;
CREATE POLICY "Users can manage wallet transactions"
ON wallet_transactions
FOR ALL
USING (
    wallet_id IN (
        SELECT w.id FROM wallets w
        JOIN profiles p ON p.id = w.profile_id
        WHERE p.user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
);

-- 3. Add stripe payment handling
CREATE TABLE IF NOT EXISTS payment_intents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    stripe_payment_intent_id TEXT NOT NULL UNIQUE,
    booking_id UUID REFERENCES bookings(id),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    status TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Add missing indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record 
ON audit_log(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_payment_intents_booking 
ON payment_intents(booking_id);

CREATE INDEX IF NOT EXISTS idx_payment_intents_status 
ON payment_intents(status);

-- 5. Add helper function for booking validation
CREATE OR REPLACE FUNCTION validate_booking_schedule()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if schedule is available
    IF NOT EXISTS (
        SELECT 1 FROM lesson_schedules
        WHERE id = NEW.schedule_id
        AND is_available = true
        AND start_time > now()
    ) THEN
        RAISE EXCEPTION 'Schedule is not available';
    END IF;

    -- Check for schedule conflicts
    IF EXISTS (
        SELECT 1 FROM bookings
        WHERE schedule_id = NEW.schedule_id
        AND status NOT IN ('cancelled', 'completed')
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ) THEN
        RAISE EXCEPTION 'Schedule already booked';
    END IF;

    -- Check student booking limit
    IF (
        SELECT COUNT(*) FROM bookings
        WHERE student_id = NEW.student_id
        AND status = 'pending'
    ) >= 5 THEN
        RAISE EXCEPTION 'Too many pending bookings';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_booking
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION validate_booking_schedule();

-- 6. Add function for teacher availability
CREATE OR REPLACE FUNCTION get_teacher_availability(
    teacher_id UUID,
    start_date DATE,
    end_date DATE
) RETURNS TABLE (
    date DATE,
    available_slots JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH teacher_schedule AS (
        SELECT 
            ls.id,
            ls.start_time::DATE as date,
            jsonb_build_object(
                'id', ls.id,
                'start', ls.start_time,
                'end', ls.end_time,
                'is_available', ls.is_available
            ) as slot
        FROM lesson_schedules ls
        JOIN lessons l ON l.id = ls.lesson_id
        WHERE l.teacher_id = teacher_id
        AND ls.start_time::DATE BETWEEN start_date AND end_date
        AND ls.is_available = true
    )
    SELECT 
        ts.date,
        jsonb_agg(ts.slot) as available_slots
    FROM teacher_schedule ts
    GROUP BY ts.date
    ORDER BY ts.date;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Add RLS for payment_intents
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment intents"
ON payment_intents
FOR SELECT
USING (
    booking_id IN (
        SELECT b.id FROM bookings b
        WHERE b.student_id IN (
            SELECT id FROM profiles 
            WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        )
    )
);

-- 8. Grant permissions
GRANT EXECUTE ON FUNCTION get_teacher_availability TO authenticated;
GRANT EXECUTE ON FUNCTION validate_booking_schedule TO authenticated; 