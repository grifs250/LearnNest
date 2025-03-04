// Database types based on schema_full.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enum types from database schema
export type UserRole = 'student' | 'teacher' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type TransactionType = 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'payout';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

// Base entity interfaces matching database schema

/**
 * User profile in the system
 */
export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  bio?: string | null;
  phone?: string | null;
  timezone?: string;
  language?: string;
  is_active: boolean;
  metadata?: Record<string, any> | null;
  settings?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
  // Additional fields
  hourly_rate?: number | null;
  learning_goals?: string[] | null;
  age?: number | null;
  languages?: string[] | null;
  education_documents?: string[] | null;
  tax_id?: string | null;
  personal_id?: string | null;
  verification_status?: string | null;
  stripe_customer_id?: string | null;
  stripe_account_id?: string | null;
}

/**
 * Student-specific profile information
 */
export interface StudentProfile {
  id: string;
  learning_goals?: string[] | null;
  interests?: string[] | null;
  preferred_languages?: string[] | null;
  study_schedule?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Teacher-specific profile information
 */
export interface TeacherProfile {
  id: string;
  education?: string[] | null;
  experience?: string[] | null;
  certificates?: string[] | null;
  specializations?: string[] | null;
  hourly_rate: number;
  rating?: number | null;
  total_reviews?: number;
  availability?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Category of subjects
 */
export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  subjects?: Subject[];
}

/**
 * Subject within a category
 */
export interface Subject {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon_url?: string | null;
  is_active: boolean;
  parent_id?: string | null;
  category_id?: string | null;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Teachers' subjects with experience and rates
 */
export interface TeacherSubject {
  teacher_id: string;
  subject_id: string;
  experience_years?: number;
  hourly_rate?: number;
  is_verified?: boolean;
  created_at?: string;
}

/**
 * Lesson offered by a teacher
 */
export interface Lesson {
  id: string;
  teacher_id: string;
  subject_id: string;
  title: string;
  description?: string | null;
  duration: number;
  max_students: number;
  price: number;
  is_active: boolean;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Scheduled time slots for lessons
 */
export interface LessonSchedule {
  id: string;
  lesson_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Teacher's weekly work hours
 */
export interface TeacherWorkHours {
  id: string;
  teacher_id: string;
  day_0?: string | null; // Sunday
  day_1?: string | null; // Monday
  day_2?: string | null; // Tuesday
  day_3?: string | null; // Wednesday
  day_4?: string | null; // Thursday
  day_5?: string | null; // Friday
  day_6?: string | null; // Saturday
  created_at?: string;
  updated_at?: string;
}

/**
 * Booking for a lesson schedule
 */
export interface Booking {
  id: string;
  student_id: string;
  schedule_id: string;
  amount: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Review for a booking
 */
export interface Review {
  id: string;
  booking_id: string;
  student_id: string;
  teacher_id: string;
  rating: number;
  comment?: string | null;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Message between users
 */
export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at?: string;
}

/**
 * Notification for a user
 */
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  metadata?: Record<string, any> | null;
  created_at?: string;
}

/**
 * Payment intent
 */
export interface PaymentIntent {
  id: string;
  stripe_payment_intent_id: string;
  booking_id?: string | null;
  amount: number;
  currency: string;
  status: string;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * User wallet
 */
export interface Wallet {
  id: string;
  profile_id?: string | null;
  balance: number;
  currency: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Wallet transaction
 */
export interface WalletTransaction {
  id: string;
  wallet_id?: string | null;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  metadata?: Record<string, any> | null;
  created_at?: string;
}

// View types
export interface UserProfile extends Profile {
  teacher_bio?: string | null;
  teacher_rate?: number | null;
  student_goals?: string[] | null;
  profile_type: UserRole;
  url_slug: string;
  page_title: string;
  rating?: number;
  total_reviews?: number;
}

// Composite types with related entities
export interface LessonWithSchedule extends Lesson {
  schedules?: LessonSchedule[];
  teacher?: Profile;
  subject?: Subject;
}

export interface BookingWithDetails extends Booking {
  schedule?: LessonSchedule;
  lesson?: Lesson;
  student?: Profile;
  teacher?: Profile;
  reviews?: Review[];
}

export interface TeacherWithSubjects extends Profile {
  subjects?: (TeacherSubject & { subject: Subject })[];
  work_hours?: TeacherWorkHours;
}

export interface LessonWithProfile extends Lesson {
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  };
  teacher?: {
    full_name: string;
    avatar_url?: string | null;
  };
  subject?: {
    name: string;
    slug: string;
    category_id: string;
  };
}

// Database function return types
export interface AvailabilityDay {
  date: string;
  available_slots: {
    id: string;
    start: string;
    end: string;
    is_available: boolean;
  }[];
} 