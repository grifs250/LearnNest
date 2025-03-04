/**
 * Central database types for MāciesTe application
 * All database-related types should be defined here to maintain consistency
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: Booking
        Insert: Omit<Booking, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>
      }
      lessons: {
        Row: Lesson
        Insert: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Lesson, 'id' | 'created_at' | 'updated_at'>>
      }
      lesson_schedules: {
        Row: LessonSchedule
        Insert: Omit<LessonSchedule, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<LessonSchedule, 'id' | 'created_at' | 'updated_at'>>
      }
      subjects: {
        Row: Subject
        Insert: Omit<Subject, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subject, 'id' | 'created_at' | 'updated_at'>>
      }
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      lessons_with_profiles: {
        Row: LessonWithProfile
      }
      user_profiles_view: {
        Row: UserProfile
      }
    }
    Functions: {
      get_available_lessons: {
        Args: { p_category_id?: string }
        Returns: { subject_id: string; lesson_count: number }[]
      }
      get_teacher_lessons: {
        Args: { p_teacher_id: string }
        Returns: Lesson[]
      }
      get_student_bookings: {
        Args: { p_student_id: string }
        Returns: BookingWithDetails[]
      }
    }
  }
}

// Enum types for the application
export type UserRole = 'student' | 'teacher' | 'admin';

export type BookingStatus = 'pending' | 'confirmed' | 'canceled' | 'completed';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// For backward compatibility with old code
export type Profile = UserProfile;
export type TeacherProfile = UserProfile & { profile_type: 'teacher' };
export type StudentProfile = UserProfile & { profile_type: 'student' };
export type LessonWithSchedule = Lesson & { schedules: LessonSchedule[] };

// Base entity interfaces
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string | null
}

// User Profile
export interface UserProfile extends BaseEntity {
  user_id: string
  email: string
  full_name: string
  profile_type: 'student' | 'teacher' | 'admin'
  avatar_url: string | null
  url_slug: string
  page_title: string
  page_description: string | null
  teacher_bio: string | null
  teacher_rate: number | null
  teacher_experience_years: number | null
  teacher_specializations: string[] | null
  teacher_education: string[] | null
  teacher_certificates: string[] | null
  student_goals: string | null
  is_active: boolean
  rating?: number | null
  total_reviews?: number | null
}

// Category
export interface Category extends BaseEntity {
  name: string
  description: string | null
  image_url: string | null
  slug: string
  is_active: boolean
  display_order: number
}

// Subject
export interface Subject extends BaseEntity {
  name: string
  description: string | null
  image_url: string | null
  category_id: string
  is_active: boolean
  display_order: number
}

// Lesson
export interface Lesson extends BaseEntity {
  title: string
  description: string | null
  price: number
  duration: number
  subject_id: string
  teacher_id: string
  image_url: string | null
  video_url: string | null
  is_active: boolean
  is_featured: boolean
  is_online: boolean
  max_students: number
  location: string | null
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null
  language: string
  tags: string[] | null
}

// Lesson with Teacher Profile
export interface LessonWithProfile extends Lesson {
  teacher: Pick<UserProfile, 'full_name' | 'avatar_url' | 'rating' | 'url_slug'> 
}

// Lesson Schedule
export interface LessonSchedule extends BaseEntity {
  lesson_id: string
  start_time: string
  end_time: string
  is_available: boolean
  recurring_pattern: string | null
  max_students: number | null
  location: string | null
  is_online: boolean | null
  meeting_url: string | null
}

// Booking
export interface Booking extends BaseEntity {
  student_id: string
  lesson_schedule_id: string
  status: BookingStatus
  payment_status: PaymentStatus
  payment_id: string | null
  notes: string | null
}

// Booking with details (for displaying to students)
export interface BookingWithDetails extends Booking {
  lesson: Pick<Lesson, 'title' | 'price' | 'duration' | 'image_url'> & {
    teacher: Pick<UserProfile, 'full_name' | 'avatar_url'>
  }
  schedule: Pick<LessonSchedule, 'start_time' | 'end_time' | 'location' | 'is_online' | 'meeting_url'>
}

// Category with Subjects
export interface CategoryWithSubjects extends Category {
  subjects: Subject[]
} 