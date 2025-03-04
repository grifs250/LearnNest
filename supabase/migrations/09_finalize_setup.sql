-- 1. Add missing policies for new tables
DROP POLICY IF EXISTS "Users can view own wallet transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Users can view own lesson progress" ON lesson_progress;
DROP POLICY IF EXISTS "Admins can manage notification templates" ON notification_templates;

-- Wallet transaction policies
CREATE POLICY "Users can view own wallet transactions"
ON wallet_transactions
FOR SELECT
USING (
    wallet_id IN (
        SELECT w.id FROM wallets w
        JOIN profiles p ON p.id = w.profile_id
        WHERE p.user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
);

-- Lesson progress policies
CREATE POLICY "Users can view own lesson progress"
ON lesson_progress
FOR SELECT
USING (
    student_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
    OR 
    booking_id IN (
        SELECT b.id FROM bookings b
        JOIN lesson_schedules ls ON ls.id = b.schedule_id
        JOIN lessons l ON l.id = ls.lesson_id
        WHERE l.teacher_id IN (
            SELECT id FROM profiles 
            WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
            AND role = 'teacher'
        )
    )
);

-- Admin only policies
CREATE POLICY "Admins can manage notification templates"
ON notification_templates
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        AND role = 'admin'
    )
);

-- 2. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at 
ON wallet_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_booking 
ON lesson_progress(booking_id);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_student 
ON lesson_progress(student_id);

CREATE INDEX IF NOT EXISTS idx_notifications_template 
ON notifications(template_id);

-- 3. Add helper functions for common operations
CREATE OR REPLACE FUNCTION get_teacher_earnings(teacher_id UUID, start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS TABLE (
    total_earnings DECIMAL(10,2),
    completed_lessons INTEGER,
    pending_amount DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(wt.amount) FILTER (WHERE wt.status = 'completed'), 0) as total_earnings,
        COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed') as completed_lessons,
        COALESCE(SUM(wt.amount) FILTER (WHERE wt.status = 'pending'), 0) as pending_amount
    FROM profiles p
    LEFT JOIN wallets w ON w.profile_id = p.id
    LEFT JOIN wallet_transactions wt ON wt.wallet_id = w.id
    LEFT JOIN lessons l ON l.teacher_id = p.id
    LEFT JOIN lesson_schedules ls ON ls.lesson_id = l.id
    LEFT JOIN bookings b ON b.schedule_id = ls.id
    WHERE p.id = teacher_id
    AND (start_date IS NULL OR wt.created_at >= start_date)
    AND (end_date IS NULL OR wt.created_at <= end_date);
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Add automated cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    -- Delete notifications older than 6 months
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '6 months'
    AND is_read = true;
    
    -- Archive completed bookings older than 1 year
    UPDATE bookings
    SET metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{archived}',
        'true'::jsonb
    )
    WHERE status = 'completed'
    AND created_at < NOW() - INTERVAL '1 year'
    AND (metadata->>'archived') IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job for cleanup (if pg_cron is available)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        SELECT cron.schedule('0 0 * * 0', $$SELECT cleanup_old_notifications()$$);
    END IF;
EXCEPTION
    WHEN undefined_table THEN 
        NULL; -- pg_cron not available
END $$;

-- 5. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_teacher_earnings TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_notifications TO service_role;

-- 6. Add missing constraints for data integrity
ALTER TABLE lesson_progress
    ADD CONSTRAINT valid_completion_status 
    CHECK (completion_status IN ('not_started', 'in_progress', 'completed', 'failed'));

ALTER TABLE notification_templates
    ADD CONSTRAINT valid_template_type 
    CHECK (type IN ('email', 'sms', 'in_app', 'push'));

-- 7. Create audit log function
CREATE OR REPLACE FUNCTION log_table_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        changed_by
    ) VALUES (
        TG_TABLE_NAME::TEXT,
        COALESCE(NEW.id, OLD.id)::UUID,
        TG_OP,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('UPDATE', 'INSERT') THEN row_to_json(NEW) ELSE NULL END,
        current_setting('request.jwt.claims', true)::jsonb->>'sub'
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for important tables
CREATE TRIGGER audit_bookings_changes
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW EXECUTE FUNCTION log_table_changes();

CREATE TRIGGER audit_wallet_transactions_changes
    AFTER INSERT OR UPDATE OR DELETE ON wallet_transactions
    FOR EACH ROW EXECUTE FUNCTION log_table_changes(); 