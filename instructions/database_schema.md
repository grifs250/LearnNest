# Database Schema Documentation

## Custom Types and Enums

```sql
CREATE TYPE "public"."booking_status" AS ENUM (
    'pending',
    'confirmed',
    'cancelled',
    'completed'
);

CREATE TYPE "public"."payment_status" AS ENUM (
    'pending',
    'paid',
    'refunded',
    'failed'
);

CREATE TYPE "public"."user_role" AS ENUM (
    'student',
    'teacher',
    'admin'
);
```

## Table Definitions

### User Management

#### profiles
```sql
CREATE TABLE "public"."profiles" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" text NOT NULL,  -- Added for Clerk integration
    "email" text NOT NULL,
    "full_name" text NOT NULL,
    "role" user_role DEFAULT 'student'::user_role NOT NULL,
    "avatar_url" text,
    "bio" text,
    "is_active" boolean DEFAULT true,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "settings" jsonb DEFAULT '{}'::jsonb,
    "hourly_rate" numeric(10,2),
    "learning_goals" text[],
    "phone" text,
    "age" integer,
    "languages" text[] DEFAULT ARRAY[]::text[],
    "education_documents" text[] DEFAULT ARRAY[]::text[],
    "tax_id" text,
    "personal_id" text,
    "verification_status" text DEFAULT 'pending'::text,
    "stripe_customer_id" text,
    "stripe_account_id" text,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "valid_age" CHECK (age >= 13),
    CONSTRAINT "valid_email" CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT "valid_phone" CHECK (phone ~ '^\+?[1-9]\d{1,14}$'),
    CONSTRAINT "valid_metadata" CHECK (jsonb_typeof(metadata) = 'object'),
    CONSTRAINT "valid_settings" CHECK (jsonb_typeof(settings) = 'object')
);
```

#### student_profiles
```sql
CREATE TABLE "public"."student_profiles" (
    "id" uuid NOT NULL,
    "learning_goals" text[],
    "interests" text[],
    "preferred_languages" text[],
    "study_schedule" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "student_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE
);
```

#### teacher_profiles
```sql
CREATE TABLE "public"."teacher_profiles" (
    "id" uuid NOT NULL,
    "education" text[],
    "experience" text[],
    "certificates" text[],
    "specializations" text[],
    "hourly_rate" numeric(10,2) NOT NULL,
    "rating" numeric(3,2),
    "total_reviews" integer DEFAULT 0,
    "availability" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "check_hourly_rate_positive" CHECK (hourly_rate >= 0),
    CONSTRAINT "teacher_profiles_rating_check" CHECK (rating >= 0 AND rating <= 5),
    CONSTRAINT "teacher_profiles_total_reviews_check" CHECK (total_reviews >= 0),
    CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "teacher_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE
);
```

### Educational Content

#### categories
```sql
CREATE TABLE "public"."categories" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "categories_name_key" UNIQUE ("name")
);
```

#### subjects
```sql
CREATE TABLE "public"."subjects" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" text NOT NULL,
    "slug" text NOT NULL,
    "description" text,
    "icon_url" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "parent_id" uuid,
    "category_id" uuid,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "valid_slug" CHECK (slug ~* '^[a-z0-9-]+$'),
    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subjects_slug_key" UNIQUE ("slug"),
    CONSTRAINT "subjects_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."subjects"("id") ON DELETE SET NULL,
    CONSTRAINT "subjects_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL
);
```

#### teacher_subjects
```sql
CREATE TABLE "public"."teacher_subjects" (
    "teacher_id" uuid NOT NULL,
    "subject_id" uuid NOT NULL,
    "experience_years" integer DEFAULT 0,
    "hourly_rate" numeric(10,2),
    "is_verified" boolean DEFAULT false,
    "created_at" timestamptz DEFAULT now(),
    CONSTRAINT "teacher_subjects_experience_years_check" CHECK (experience_years >= 0),
    CONSTRAINT "teacher_subjects_hourly_rate_check" CHECK (hourly_rate >= 0),
    CONSTRAINT "teacher_subjects_pkey" PRIMARY KEY ("teacher_id", "subject_id"),
    CONSTRAINT "teacher_subjects_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE CASCADE,
    CONSTRAINT "teacher_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE
);
```

### Lesson Management

#### lessons
```sql
CREATE TABLE "public"."lessons" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "teacher_id" uuid NOT NULL,
    "subject_id" uuid NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "duration" integer NOT NULL,
    "max_students" integer DEFAULT 1,
    "price" numeric(10,2) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "check_duration_positive" CHECK (duration > 0),
    CONSTRAINT "check_price_positive" CHECK (price >= 0),
    CONSTRAINT "lessons_max_students_check" CHECK (max_students > 0),
    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "lessons_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE CASCADE,
    CONSTRAINT "lessons_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE RESTRICT
);
```

#### lesson_schedules
```sql
CREATE TABLE "public"."lesson_schedules" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "lesson_id" uuid NOT NULL,
    "start_time" timestamptz NOT NULL,
    "end_time" timestamptz NOT NULL,
    "is_available" boolean DEFAULT true NOT NULL,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "valid_schedule" CHECK (end_time > start_time),
    CONSTRAINT "no_schedule_overlap" UNIQUE NULLS NOT DISTINCT (lesson_id, start_time, end_time),
    CONSTRAINT "lesson_schedules_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "lesson_schedules_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE
);
```

#### teacher_work_hours
```sql
CREATE TABLE "public"."teacher_work_hours" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "teacher_id" uuid NOT NULL,
    "day_0" text, -- Sunday
    "day_1" text, -- Monday
    "day_2" text, -- Tuesday
    "day_3" text, -- Wednesday
    "day_4" text, -- Thursday
    "day_5" text, -- Friday
    "day_6" text, -- Saturday
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "teacher_work_hours_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "teacher_work_hours_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id")
);
```

### Booking System

#### bookings
```sql
CREATE TABLE "public"."bookings" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "schedule_id" uuid NOT NULL,
    "student_id" uuid NOT NULL,
    "amount" numeric NOT NULL,
    "status" booking_status,
    "payment_status" payment_status,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "unique_student_schedule" UNIQUE ("student_id", "schedule_id"),
    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "bookings_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."lesson_schedules"("id") ON DELETE CASCADE,
    CONSTRAINT "bookings_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("id") ON DELETE RESTRICT
);
```

#### reviews
```sql
CREATE TABLE "public"."reviews" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "booking_id" uuid NOT NULL,
    "student_id" uuid NOT NULL,
    "teacher_id" uuid NOT NULL,
    "rating" integer NOT NULL,
    "comment" text,
    "is_public" boolean DEFAULT true,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "check_rating_range" CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT "one_review_per_booking" UNIQUE ("booking_id"),
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE,
    CONSTRAINT "reviews_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("id") ON DELETE CASCADE,
    CONSTRAINT "reviews_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE CASCADE
);
```

### Communication

#### messages
```sql
CREATE TABLE "public"."messages" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "booking_id" uuid NOT NULL,
    "sender_id" uuid NOT NULL,
    "content" text NOT NULL,
    "is_read" boolean DEFAULT false,
    "created_at" timestamptz DEFAULT now(),
    CONSTRAINT "messages_content_check" CHECK (length(content) > 0),
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "messages_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE,
    CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE
);
```

#### notifications
```sql
CREATE TABLE "public"."notifications" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "type" text NOT NULL,
    "title" text NOT NULL,
    "message" text NOT NULL,
    "is_read" boolean DEFAULT false,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamptz DEFAULT now(),
    CONSTRAINT "notifications_message_check" CHECK (length(message) > 0),
    CONSTRAINT "notifications_title_check" CHECK (length(title) > 0),
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE
);
```

### wallet_transactions
```sql
CREATE TABLE "public"."wallet_transactions" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "wallet_id" uuid,
    "amount" numeric(10,2) NOT NULL,
    "type" text,
    "status" text,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamptz DEFAULT now(),
    CONSTRAINT "wallet_transactions_status_check" CHECK (status = ANY (ARRAY['pending', 'completed', 'failed'])),
    CONSTRAINT "wallet_transactions_type_check" CHECK (type = ANY (ARRAY['deposit', 'withdrawal', 'payment', 'refund', 'payout']))
);
```

### wallets
```sql
CREATE TABLE "public"."wallets" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "profile_id" uuid,
    "balance" numeric(10,2) DEFAULT 0.00,
    "currency" text DEFAULT 'EUR'::text,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "positive_balance" CHECK (balance >= 0)
);
```

## Important Indexes

### Booking Indexes
```sql
CREATE INDEX "idx_bookings_status" ON "public"."bookings" USING btree (status, payment_status);
CREATE INDEX "idx_bookings_student" ON "public"."bookings" USING btree (student_id);
```

### Lesson Indexes
```sql
CREATE INDEX "idx_lessons_is_active" ON "public"."lessons" USING btree (is_active);
CREATE INDEX "idx_lessons_teacher" ON "public"."lessons" USING btree (teacher_id);
CREATE INDEX "idx_lessons_subject" ON "public"."lessons" USING btree (subject_id);
CREATE INDEX "idx_lessons_search" ON "public"."lessons" USING gin (to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX "idx_lessons_title_trgm" ON "public"."lessons" USING gin (title gin_trgm_ops);
```

### Schedule Indexes
```sql
CREATE INDEX "idx_lesson_schedules_availability" ON "public"."lesson_schedules" USING btree (lesson_id, start_time, is_available);
CREATE INDEX "idx_lesson_schedules_time" ON "public"."lesson_schedules" USING btree (start_time, end_time);
```

### Profile Indexes
```sql
CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING btree (role);
CREATE INDEX "idx_profiles_email_trgm" ON "public"."profiles" USING gin (email gin_trgm_ops);
CREATE INDEX "idx_profiles_full_name_trgm" ON "public"."profiles" USING gin (full_name gin_trgm_ops);
CREATE INDEX "idx_profiles_search" ON "public"."profiles" USING gin (to_tsvector('english', full_name || ' ' || COALESCE(bio, '')));
CREATE INDEX "idx_profiles_verification" ON profiles(verification_status) 
    WHERE verification_status = 'pending';
CREATE INDEX "idx_profiles_role_user_id" ON profiles(role, user_id);
```

### Subject Indexes
```sql
CREATE INDEX "idx_subjects_category_id" ON "public"."subjects" USING btree (category_id);
CREATE INDEX "idx_subjects_name_trgm" ON "public"."subjects" USING gin (name gin_trgm_ops);
CREATE INDEX "idx_subjects_search" ON "public"."subjects" USING gin (to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX "idx_subjects_slug" ON "public"."subjects" USING btree (slug);
```

### Communication Indexes
```sql
CREATE INDEX "idx_messages_booking" ON "public"."messages" USING btree (booking_id);
CREATE INDEX "idx_messages_created_at" ON "public"."messages" USING btree (created_at DESC);
CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING btree (user_id, is_read);
CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING btree (created_at DESC);
```

### Wallet Indexes
```sql
CREATE INDEX "idx_wallet_transactions_type" ON wallet_transactions(wallet_id, type, created_at);
```

## Core Tables

### profiles
- Primary user information
- Linked to Clerk via clerk_id
- RLS: Users can read all active profiles, update own profile

### lessons
- Lesson information
- RLS: Public read, teacher can manage own lessons

### bookings
- Lesson bookings
- RLS: Students see own bookings, teachers see related bookings

## Types

### Enums
- user_role: 'student' | 'teacher' | 'admin'
- booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
- payment_status: 'pending' | 'paid' | 'refunded' | 'failed'

## Security
- All tables have RLS enabled
- Policies use Clerk JWT claims
- Admin operations use service role key 

## Additional Functions

```sql
-- Get current user ID from Clerk JWT
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT user_id FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    LIMIT 1;
$$;

-- Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
        AND role = required_role
    );
$$;

-- Check if user is teacher
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    AND role = 'teacher'
  )
$$;
```

## Additional Types and Functions

### Custom Functions

```sql
-- Check if table exists
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

-- Create work hours table
CREATE OR REPLACE FUNCTION public.create_work_hours_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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
  END IF;
END;
$$;

-- Get teacher availability
CREATE OR REPLACE FUNCTION public.get_teacher_availability(
    teacher_id uuid,
    start_date date,
    end_date date
)
RETURNS TABLE(
    date date,
    available_slots jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Validate profile role
CREATE OR REPLACE FUNCTION public.validate_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validate teacher data
    IF NEW.role = 'teacher' AND NEW.hourly_rate IS NULL THEN
        NEW.hourly_rate := 0.00;  -- Default rate
    END IF;
    
    -- Validate student data
    IF NEW.role = 'student' AND NEW.learning_goals IS NULL THEN
        NEW.learning_goals := ARRAY[]::TEXT[];  -- Empty goals array
    END IF;
    
    RETURN NEW;
END;
$$;
```

### Triggers

```sql
-- Update updated_at column trigger
CREATE OR REPLACE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Validate profile role trigger
CREATE OR REPLACE TRIGGER ensure_profile_role
    BEFORE INSERT OR UPDATE OF role ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_profile_role();

-- Validate student booking trigger
CREATE OR REPLACE TRIGGER ensure_student_role
    BEFORE INSERT OR UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_student_booking();

-- Validate teacher lesson trigger
CREATE OR REPLACE TRIGGER ensure_teacher_role
    BEFORE INSERT OR UPDATE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_teacher_lesson();
```

## Additional Types and Validation

### Form Schema Types
```sql
-- Lesson type validation
CREATE OR REPLACE FUNCTION validate_lesson_type()
RETURNS trigger AS $$
BEGIN
    IF NEW.type NOT IN ('one_on_one', 'group', 'workshop') THEN
        RAISE EXCEPTION 'Invalid lesson type';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Message type validation
CREATE OR REPLACE FUNCTION validate_message_type()
RETURNS trigger AS $$
BEGIN
    IF NEW.type NOT IN ('text', 'file', 'system') THEN
        RAISE EXCEPTION 'Invalid message type';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Notification type validation
CREATE OR REPLACE FUNCTION validate_notification_type()
RETURNS trigger AS $$
BEGIN
    IF NEW.type NOT IN ('booking', 'message', 'payment', 'system') THEN
        RAISE EXCEPTION 'Invalid notification type';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Transaction type validation
CREATE OR REPLACE FUNCTION validate_transaction_type()
RETURNS trigger AS $$
BEGIN
    IF NEW.type NOT IN ('deposit', 'withdrawal', 'payment', 'refund', 'payout') THEN
        RAISE EXCEPTION 'Invalid transaction type';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Constant Types
```sql
-- Lesson types
CREATE TYPE lesson_type AS ENUM (
    'one_on_one',
    'group',
    'workshop'
);

-- Message types
CREATE TYPE message_type AS ENUM (
    'text',
    'file',
    'system'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
    'booking',
    'message',
    'payment',
    'system'
);

-- Transaction types
CREATE TYPE transaction_type AS ENUM (
    'deposit',
    'withdrawal',
    'payment',
    'refund',
    'payout'
);
``` 