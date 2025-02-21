-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better text search
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- For accent-insensitive search

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create teacher_profiles table
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  education TEXT[],
  experience TEXT[],
  certificates TEXT[],
  specializations TEXT[],
  hourly_rate DECIMAL(10,2) NOT NULL CHECK (hourly_rate >= 0),
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0),
  availability JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  learning_goals TEXT[],
  interests TEXT[],
  preferred_languages TEXT[],
  study_schedule JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9-]+$'),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL
);

-- Create teacher_subjects table (many-to-many)
CREATE TABLE IF NOT EXISTS teacher_subjects (
  teacher_id UUID REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  experience_years INTEGER DEFAULT 0 CHECK (experience_years >= 0),
  hourly_rate DECIMAL(10,2) CHECK (hourly_rate >= 0),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (teacher_id, subject_id)
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL CHECK (duration > 0), -- in minutes
  max_students INTEGER DEFAULT 1 CHECK (max_students > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lesson_schedules table
CREATE TABLE IF NOT EXISTS lesson_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_schedule CHECK (end_time > start_time),
  CONSTRAINT no_schedule_overlap UNIQUE NULLS NOT DISTINCT (lesson_id, start_time, end_time)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT,
  schedule_id UUID NOT NULL REFERENCES lesson_schedules(id) ON DELETE RESTRICT,
  status booking_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_schedule UNIQUE (student_id, schedule_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT one_review_per_booking UNIQUE (booking_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) > 0),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL CHECK (length(title) > 0),
  message TEXT NOT NULL CHECK (length(message) > 0),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (id, name, description) VALUES
  (uuid_generate_v4(), 'Mācību priekšmeti', 'Various subjects for learning'),
  (uuid_generate_v4(), 'Valodas', 'Language courses'),
  (uuid_generate_v4(), 'IT kursi', 'Information Technology courses');

-- Additional indexes for better query performance
DO $$ BEGIN
  -- Existing indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_role') THEN
    CREATE INDEX idx_profiles_role ON profiles(role);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_teacher_profiles_rating') THEN
    CREATE INDEX idx_teacher_profiles_rating ON teacher_profiles(rating);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subjects_slug') THEN
    CREATE INDEX idx_subjects_slug ON subjects(slug);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lessons_teacher') THEN
    CREATE INDEX idx_lessons_teacher ON lessons(teacher_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lessons_subject') THEN
    CREATE INDEX idx_lessons_subject ON lessons(subject_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lesson_schedules_time') THEN
    CREATE INDEX idx_lesson_schedules_time ON lesson_schedules(start_time, end_time);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_student') THEN
    CREATE INDEX idx_bookings_student ON bookings(student_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_status') THEN
    CREATE INDEX idx_bookings_status ON bookings(status, payment_status);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_booking') THEN
    CREATE INDEX idx_messages_booking ON messages(booking_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user') THEN
    CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
  END IF;

  -- New indexes for better performance
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_email_trgm') THEN
    CREATE INDEX idx_profiles_email_trgm ON profiles USING gin (email gin_trgm_ops);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_full_name_trgm') THEN
    CREATE INDEX idx_profiles_full_name_trgm ON profiles USING gin (full_name gin_trgm_ops);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subjects_name_trgm') THEN
    CREATE INDEX idx_subjects_name_trgm ON subjects USING gin (name gin_trgm_ops);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lessons_title_trgm') THEN
    CREATE INDEX idx_lessons_title_trgm ON lessons USING gin (title gin_trgm_ops);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_created_at') THEN
    CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_created_at') THEN
    CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
  END IF;
END $$;

-- Text search indexes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subjects_search') THEN
    CREATE INDEX idx_subjects_search ON subjects USING GIN (
      to_tsvector('english', name || ' ' || COALESCE(description, ''))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_search') THEN
    CREATE INDEX idx_profiles_search ON profiles USING GIN (
      to_tsvector('english', full_name || ' ' || COALESCE(bio, ''))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lessons_search') THEN
    CREATE INDEX idx_lessons_search ON lessons USING GIN (
      to_tsvector('english', title || ' ' || COALESCE(description, ''))
    );
  END IF;
END $$;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_teacher_profiles_updated_at') THEN
    CREATE TRIGGER update_teacher_profiles_updated_at
      BEFORE UPDATE ON teacher_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_student_profiles_updated_at') THEN
    CREATE TRIGGER update_student_profiles_updated_at
      BEFORE UPDATE ON student_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subjects_updated_at') THEN
    CREATE TRIGGER update_subjects_updated_at
      BEFORE UPDATE ON subjects
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_lessons_updated_at') THEN
    CREATE TRIGGER update_lessons_updated_at
      BEFORE UPDATE ON lessons
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_lesson_schedules_updated_at') THEN
    CREATE TRIGGER update_lesson_schedules_updated_at
      BEFORE UPDATE ON lesson_schedules
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_updated_at') THEN
    CREATE TRIGGER update_bookings_updated_at
      BEFORE UPDATE ON bookings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reviews_updated_at') THEN
    CREATE TRIGGER update_reviews_updated_at
      BEFORE UPDATE ON reviews
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies with proper security checks
DO $$ BEGIN
  -- Profiles policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Profiles are viewable by everyone') THEN
    CREATE POLICY "Profiles are viewable by everyone" ON profiles
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Teacher profiles policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teacher profiles are public') THEN
    CREATE POLICY "Teacher profiles are public" ON teacher_profiles
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers can update own profile') THEN
    CREATE POLICY "Teachers can update own profile" ON teacher_profiles
      FOR ALL USING (auth.uid() = id);
  END IF;

  -- Student profiles policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can manage own profile') THEN
    CREATE POLICY "Students can manage own profile" ON student_profiles
      FOR ALL USING (auth.uid() = id);
  END IF;

  -- Subjects policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Subjects are viewable by everyone') THEN
    CREATE POLICY "Subjects are viewable by everyone" ON subjects
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Only admins can manage subjects') THEN
    CREATE POLICY "Only admins can manage subjects" ON subjects
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role = 'admin'
        )
      );
  END IF;

  -- Teacher subjects policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teacher subjects are viewable by everyone') THEN
    CREATE POLICY "Teacher subjects are viewable by everyone" ON teacher_subjects
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers can manage own subjects') THEN
    CREATE POLICY "Teachers can manage own subjects" ON teacher_subjects
      FOR ALL USING (teacher_id = auth.uid());
  END IF;

  -- Lessons policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lessons are viewable by everyone') THEN
    CREATE POLICY "Lessons are viewable by everyone" ON lessons
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers can manage own lessons') THEN
    CREATE POLICY "Teachers can manage own lessons" ON lessons
      FOR ALL USING (teacher_id = auth.uid());
  END IF;

  -- Lesson schedules policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lesson schedules are viewable by everyone') THEN
    CREATE POLICY "Lesson schedules are viewable by everyone" ON lesson_schedules
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers can manage own lesson schedules') THEN
    CREATE POLICY "Teachers can manage own lesson schedules" ON lesson_schedules
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM lessons
          WHERE id = lesson_id
          AND teacher_id = auth.uid()
        )
      );
  END IF;

  -- Bookings policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own bookings') THEN
    CREATE POLICY "Users can view own bookings" ON bookings
      FOR SELECT USING (
        student_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM lesson_schedules ls
          JOIN lessons l ON l.id = ls.lesson_id
          WHERE ls.id = schedule_id
          AND l.teacher_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can create bookings') THEN
    CREATE POLICY "Students can create bookings" ON bookings
      FOR INSERT WITH CHECK (student_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own bookings') THEN
    CREATE POLICY "Users can update own bookings" ON bookings
      FOR UPDATE USING (
        student_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM lesson_schedules ls
          JOIN lessons l ON l.id = ls.lesson_id
          WHERE ls.id = schedule_id
          AND l.teacher_id = auth.uid()
        )
      );
  END IF;

  -- Reviews policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Reviews are viewable by everyone') THEN
    CREATE POLICY "Reviews are viewable by everyone" ON reviews
      FOR SELECT USING (is_public);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can manage own reviews') THEN
    CREATE POLICY "Students can manage own reviews" ON reviews
      FOR ALL USING (student_id = auth.uid());
  END IF;

  -- Messages policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own messages') THEN
    CREATE POLICY "Users can view own messages" ON messages
      FOR SELECT USING (
        sender_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.id = booking_id
          AND (
            b.student_id = auth.uid() OR
            EXISTS (
              SELECT 1 FROM lesson_schedules ls
              JOIN lessons l ON l.id = ls.lesson_id
              WHERE ls.id = b.schedule_id
              AND l.teacher_id = auth.uid()
            )
          )
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can send messages') THEN
    CREATE POLICY "Users can send messages" ON messages
      FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.id = booking_id
          AND (
            b.student_id = auth.uid() OR
            EXISTS (
              SELECT 1 FROM lesson_schedules ls
              JOIN lessons l ON l.id = ls.lesson_id
              WHERE ls.id = b.schedule_id
              AND l.teacher_id = auth.uid()
            )
          )
        )
      );
  END IF;

  -- Notifications policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own notifications') THEN
    CREATE POLICY "Users can view own notifications" ON notifications
      FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own notifications') THEN
    CREATE POLICY "Users can manage own notifications" ON notifications
      FOR ALL USING (user_id = auth.uid());
  END IF;
END $$; 