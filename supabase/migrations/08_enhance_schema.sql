-- 1. Drop existing enums if they exist and recreate
DROP TYPE IF EXISTS lesson_type CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS payout_status CASCADE;

DO $$ BEGIN
    CREATE TYPE lesson_type AS ENUM ('one_on_one', 'group', 'workshop');
    CREATE TYPE payment_method AS ENUM ('card', 'bank_transfer', 'wallet');
    CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Enhance profiles safely
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS age INTEGER,
    ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS education_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS tax_id TEXT,
    ADD COLUMN IF NOT EXISTS personal_id TEXT,
    ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
    ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Add constraints only if they don't exist
DO $$ BEGIN
    ALTER TABLE profiles 
        ADD CONSTRAINT valid_phone CHECK (phone ~ '^\+?[1-9]\d{1,14}$');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE profiles 
        ADD CONSTRAINT valid_age CHECK (age >= 13);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create wallet tables if they don't exist
CREATE TABLE IF NOT EXISTS wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'EUR',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT positive_balance CHECK (balance >= 0)
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'payout')),
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enhance lessons table safely
ALTER TABLE lessons
    ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS min_students INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS lesson_type lesson_type DEFAULT 'one_on_one',
    ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS prerequisites TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'beginner';

-- Add constraint only if it doesn't exist
DO $$ BEGIN
    ALTER TABLE lessons 
        ADD CONSTRAINT valid_student_count CHECK (max_students >= min_students);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Create lesson progress tracking
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id),
    completion_status TEXT DEFAULT 'not_started',
    progress_data JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Enhance bookings table safely
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
    ADD COLUMN IF NOT EXISTS cancellation_time TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS refund_status TEXT,
    ADD COLUMN IF NOT EXISTS meeting_link TEXT,
    ADD COLUMN IF NOT EXISTS meeting_data JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- 7. Create notification system
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enhance existing notifications table
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES notification_templates(id),
    ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';

-- 8. Drop existing indexes before recreating
DROP INDEX IF EXISTS idx_lessons_search_combined;
DROP INDEX IF EXISTS idx_profiles_verification;
DROP INDEX IF EXISTS idx_wallet_transactions_type;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_lessons_search_combined 
ON lessons USING gin((
    setweight(to_tsvector('english', title), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B')
));

CREATE INDEX IF NOT EXISTS idx_profiles_verification 
ON profiles(verification_status, role);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type 
ON wallet_transactions(wallet_id, type, created_at);

-- 9. Enable RLS and create policies
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating
DROP POLICY IF EXISTS "Users can manage their wallet" ON wallets;

-- Create new policies
CREATE POLICY "Users can manage their wallet"
ON wallets
FOR ALL
USING (
    profile_id IN (
        SELECT id FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
);

-- 10. Create or replace functions
CREATE OR REPLACE FUNCTION calculate_lesson_earnings(lesson_price DECIMAL, platform_fee_percentage DECIMAL DEFAULT 0.10)
RETURNS DECIMAL AS $$
BEGIN
    RETURN lesson_price * (1 - platform_fee_percentage);
END;
$$ LANGUAGE plpgsql;

-- 11. Create or replace triggers
DROP TRIGGER IF EXISTS on_booking_completion ON bookings;
DROP FUNCTION IF EXISTS handle_booking_completion();

CREATE OR REPLACE FUNCTION handle_booking_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Create lesson progress record
        INSERT INTO lesson_progress (booking_id, student_id)
        VALUES (NEW.id, NEW.student_id);
        
        -- Handle teacher payment
        INSERT INTO wallet_transactions (
            wallet_id,
            amount,
            type,
            status,
            metadata
        )
        SELECT 
            w.id,
            calculate_lesson_earnings(NEW.amount),
            'payment',
            'completed',
            jsonb_build_object('booking_id', NEW.id)
        FROM wallets w
        JOIN lessons l ON l.teacher_id = w.profile_id
        JOIN lesson_schedules ls ON ls.lesson_id = l.id
        WHERE ls.id = NEW.schedule_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_booking_completion
    AFTER UPDATE ON bookings
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION handle_booking_completion();

-- Grant necessary permissions
GRANT USAGE ON TYPE lesson_type TO authenticated;
GRANT USAGE ON TYPE payment_method TO authenticated;
GRANT USAGE ON TYPE payout_status TO authenticated; 