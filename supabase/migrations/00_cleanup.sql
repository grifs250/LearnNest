-- Drop existing triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_lessons_updated_at ON public.lessons;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
DROP TRIGGER IF EXISTS update_lesson_schedules_updated_at ON public.lesson_schedules;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
DROP TRIGGER IF EXISTS update_student_profiles_updated_at ON public.student_profiles;
DROP TRIGGER IF EXISTS update_subjects_updated_at ON public.subjects;
DROP TRIGGER IF EXISTS update_teacher_profiles_updated_at ON public.teacher_profiles;

-- Drop existing policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view active lessons" ON public.lessons;
DROP POLICY IF EXISTS "Teachers can manage their lessons" ON public.lessons;
DROP POLICY IF EXISTS "Students can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Teachers can view bookings for their lessons" ON public.bookings;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.update_updated_at();
DROP FUNCTION IF EXISTS public.update_updated_at_column(); 