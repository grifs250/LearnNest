// Remove the Database import since we now have our own definition
import type { Database } from './supabase.types';

// Re-export Database type
export type { Database };

// Utility types
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
export type Timestamp = string;

// Enums
export type UserRole = 'student' | 'teacher' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'canceled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

// Tables
export type Tables = Database['public']['Tables'];

// Row Types
export type ProfileRow = Tables['profiles']['Row'];
export type SubjectRow = Tables['subjects']['Row'];
export type TeacherSubjectRow = Tables['teacher_subjects']['Row'];
export type LessonRow = Tables['lessons']['Row'];
export type LessonScheduleRow = Tables['lesson_schedules']['Row'];
export type BookingRow = Tables['bookings']['Row'];
export type ReviewRow = Tables['reviews']['Row'];
export type MessageRow = Tables['messages']['Row'];
export type NotificationRow = Tables['notifications']['Row'];

// Insert Types
export type ProfileInsert = Tables['profiles']['Insert'];
export type SubjectInsert = Tables['subjects']['Insert'];
export type TeacherSubjectInsert = Tables['teacher_subjects']['Insert'];
export type LessonInsert = Tables['lessons']['Insert'];
export type LessonScheduleInsert = Tables['lesson_schedules']['Insert'];
export type BookingInsert = Tables['bookings']['Insert'];
export type ReviewInsert = Tables['reviews']['Insert'];
export type MessageInsert = Tables['messages']['Insert'];
export type NotificationInsert = Tables['notifications']['Insert'];

// Update Types
export type ProfileUpdate = Tables['profiles']['Update'];
export type SubjectUpdate = Tables['subjects']['Update'];
export type TeacherSubjectUpdate = Tables['teacher_subjects']['Update'];
export type LessonUpdate = Tables['lessons']['Update'];
export type LessonScheduleUpdate = Tables['lesson_schedules']['Update'];
export type BookingUpdate = Tables['bookings']['Update'];
export type ReviewUpdate = Tables['reviews']['Update'];
export type MessageUpdate = Tables['messages']['Update'];
export type NotificationUpdate = Tables['notifications']['Update'];

// Extended Types with Relations
export interface Profile extends ProfileRow {
  student_profile?: StudentProfile;
  teacher_profile?: TeacherProfile;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Subject extends SubjectRow {
  category?: Category;
  parent?: Subject;
  children?: Subject[];
  teacher_subjects?: TeacherSubject[];
  lessons?: Lesson[];
}

export interface TeacherSubject extends TeacherSubjectRow {
  teacher?: Profile;
  subject?: Subject;
}

export interface Lesson extends LessonRow {
  teacher?: Profile;
  subject?: Subject;
  schedules?: LessonSchedule[];
}

export interface LessonSchedule extends LessonScheduleRow {
  lesson?: Lesson;
  bookings?: Booking[];
}

export interface Booking extends BookingRow {
  student?: Profile;
  schedule?: LessonSchedule;
  review?: Review;
  messages?: Message[];
}

export interface Review extends ReviewRow {
  booking?: Booking;
  student?: Profile;
}

export interface Message extends MessageRow {
  booking?: Booking;
  sender?: Profile;
}

export interface Notification extends NotificationRow {
  user?: Profile;
}

// Common interfaces
export interface TimeRange {
  start: Timestamp;
  end: Timestamp;
}

export interface Availability {
  day: number; // 0-6 for Sunday-Saturday
  ranges: TimeRange[];
}

export interface TeacherAvailability {
  weekly: Availability[];
  exceptions: {
    date: Timestamp;
    ranges?: TimeRange[];
  }[];
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
  updated_at: string;
}

// Add specific profile types
export interface StudentProfile {
  id: string;
  interests?: string[] | null;
  learning_goals?: string[] | null;
  preferred_languages?: string[] | null;
  study_schedule?: Json | null;
  profile?: Profile;
}

export interface TeacherProfile {
  id: string;
  availability?: Json | null;
  certificates?: string[] | null;
  education?: string[] | null;
  experience?: string[] | null;
  hourly_rate: number;
  rating?: number | null;
  specializations?: string[] | null;
  total_reviews?: number | null;
  profile?: Profile;
} 