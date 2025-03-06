import type { Database } from './supabase';

type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];

// Base types
export type UserRole = Enums['user_role'];
export type BookingStatus = Enums['booking_status'];
export type PaymentStatus = Enums['payment_status'];

// User types
export type Profile = Tables['profiles']['Row'];
export type Teacher = Tables['teacher_profiles']['Row'] & {
  profile: Profile;
  subjects?: Subject[];
};
export type Student = Tables['student_profiles']['Row'] & {
  profile: Profile;
};

// Subject types
export type Subject = Tables['subjects']['Row'] & {
  parent?: Subject;
  children?: Subject[];
  category?: Category | null;
  lesson_count?: number; // Number of active lessons for this subject
};
export type TeacherSubject = Tables['teacher_subjects']['Row'] & {
  subject: Subject;
};

// Lesson types
export type Lesson = Tables['lessons']['Row'] & {
  teacher: Teacher;
  subject: Subject;
  schedules?: LessonSchedule[];
};
export type LessonSchedule = Tables['lesson_schedules']['Row'] & {
  lesson: Lesson;
  booking?: Booking;
};

// Booking types
export type Booking = Tables['bookings']['Row'] & {
  student: Student;
  schedule: LessonSchedule & {
    lesson: Lesson & {
      teacher: Teacher;
      subject: Subject;
    };
  };
  review?: Review;
  messages?: Message[];
};

// Review types
export type Review = Tables['reviews']['Row'] & {
  student: Student;
  teacher: Teacher;
  booking: Booking;
};

// Message types
export type Message = Tables['messages']['Row'] & {
  sender: Profile;
  booking: Booking;
};

// Notification types
export type Notification = Tables['notifications']['Row'] & {
  user: Profile;
};

// Insert types
export type CreateTeacher = Tables['teacher_profiles']['Insert'];
export type CreateStudent = Tables['student_profiles']['Insert'];
export type CreateLesson = Tables['lessons']['Insert'];
export type CreateBooking = Tables['bookings']['Insert'];
export type CreateReview = Tables['reviews']['Insert'];

// Update types
export type UpdateTeacher = Tables['teacher_profiles']['Update'];
export type UpdateStudent = Tables['student_profiles']['Update'];
export type UpdateLesson = Tables['lessons']['Update'];
export type UpdateBooking = Tables['bookings']['Update'];
export type UpdateReview = Tables['reviews']['Update'];

// Utility types
export type Json = Record<string, any>; // or use the actual type from your Database type
export type Timestamp = string; // ISO string format

// Common interfaces
export interface TimeRange {
  start: Timestamp;
  end: Timestamp;
}

export interface Availability {
  weekday: number; // 0-6 (Sunday-Saturday)
  ranges: TimeRange[];
}

export interface TeacherAvailability {
  recurring: Availability[];
  exceptions: {
    date: Timestamp;
    ranges?: TimeRange[];
    isUnavailable?: boolean;
  }[];
}

export interface StudentSchedule {
  preferredDays: number[]; // 0-6 (Sunday-Saturday)
  preferredTimes: {
    start: string; // HH:mm format
    end: string; // HH:mm format
  }[];
  exceptions: {
    date: Timestamp;
    isUnavailable: boolean;
  }[];
}

export type Category = Tables['categories']['Row'];

// Form schema for subjects
export interface SubjectFormData {
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  category_id?: string;
  is_active?: boolean;
  metadata?: Record<string, any>;
} 