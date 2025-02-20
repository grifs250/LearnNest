import type { Database } from './supabase.types';

// Re-export Database type
export type { Database };

// Utility types
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
export type Timestamp = string;

// Enums
export type UserRole = Database['public']['Enums']['user_role'];
export type BookingStatus = Database['public']['Enums']['booking_status'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];

// Tables
export type Tables = Database['public']['Tables'];

// Row Types
export type ProfileRow = Tables['profiles']['Row'];
export type TeacherProfileRow = Tables['teacher_profiles']['Row'];
export type StudentProfileRow = Tables['student_profiles']['Row'];
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
export type TeacherProfileInsert = Tables['teacher_profiles']['Insert'];
export type StudentProfileInsert = Tables['student_profiles']['Insert'];
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
export type TeacherProfileUpdate = Tables['teacher_profiles']['Update'];
export type StudentProfileUpdate = Tables['student_profiles']['Update'];
export type SubjectUpdate = Tables['subjects']['Update'];
export type TeacherSubjectUpdate = Tables['teacher_subjects']['Update'];
export type LessonUpdate = Tables['lessons']['Update'];
export type LessonScheduleUpdate = Tables['lesson_schedules']['Update'];
export type BookingUpdate = Tables['bookings']['Update'];
export type ReviewUpdate = Tables['reviews']['Update'];
export type MessageUpdate = Tables['messages']['Update'];
export type NotificationUpdate = Tables['notifications']['Update'];

// Extended Types with Relations
export interface Profile extends Omit<ProfileRow, 'metadata'> {
  metadata?: Json;
  teacher_profile?: TeacherProfile;
  student_profile?: StudentProfile;
}

export interface TeacherProfile extends TeacherProfileRow {
  profile?: Profile;
  subjects?: TeacherSubject[];
  lessons?: Lesson[];
}

export interface StudentProfile extends StudentProfileRow {
  profile?: Profile;
  bookings?: Booking[];
}

export interface Subject extends SubjectRow {
  parent?: Subject;
  children?: Subject[];
  teachers?: TeacherSubject[];
  lessons?: Lesson[];
}

export interface TeacherSubject extends TeacherSubjectRow {
  teacher?: TeacherProfile;
  subject?: Subject;
}

export interface Lesson extends LessonRow {
  teacher?: TeacherProfile;
  subject?: Subject;
  schedules?: LessonSchedule[];
}

export interface LessonSchedule extends LessonScheduleRow {
  lesson?: Lesson;
  bookings?: Booking[];
}

export interface Booking extends BookingRow {
  student?: StudentProfile;
  schedule?: LessonSchedule;
  review?: Review;
  messages?: Message[];
}

export interface Review extends ReviewRow {
  booking?: Booking;
  student?: StudentProfile;
  teacher?: TeacherProfile;
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