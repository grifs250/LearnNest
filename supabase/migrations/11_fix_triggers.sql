-- First, drop all existing triggers
DO $$ 
BEGIN
    -- Drop all update_*_updated_at triggers
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
    DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
    DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
    DROP TRIGGER IF EXISTS update_lesson_schedules_updated_at ON lesson_schedules;
    DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
    DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
    DROP TRIGGER IF EXISTS update_wallet_transactions_updated_at ON wallet_transactions;
    
    -- Drop all validation triggers
    DROP TRIGGER IF EXISTS validate_booking ON bookings;
    DROP TRIGGER IF EXISTS ensure_teacher_role ON lessons;
    DROP TRIGGER IF EXISTS ensure_student_role ON bookings;
    DROP TRIGGER IF EXISTS ensure_profile_role ON profiles;
    
    -- Drop all audit triggers
    DROP TRIGGER IF EXISTS audit_bookings_changes ON bookings;
    DROP TRIGGER IF EXISTS audit_wallet_transactions_changes ON wallet_transactions;
    
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Recreate the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate all update triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ... add other triggers as needed

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated; 