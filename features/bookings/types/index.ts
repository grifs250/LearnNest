/**
 * Booking-related types for MāciesTe application
 */

import { BaseEntity } from '@/features/shared/types';
import { User } from '@/features/auth/types/types';
import { UserProfile } from '@/types/database';
import type { Database } from '@/types/supabase.types';
import type { 
  Booking as DatabaseBooking,
  BookingStatus,
  BookingWithDetails,
  LessonSchedule as DatabaseLessonSchedule,
  PaymentStatus,
  UserProfile as SupabaseUserProfile
} from '@/types/database';

// Core enum types from the database
export type { BookingStatus, PaymentStatus };

// Database table types
export type DbBooking = Database['public']['Tables']['bookings']['Row'];
export type DbSchedule = Database['public']['Tables']['lesson_schedules']['Row'];
export type DbLesson = Database['public']['Tables']['lessons']['Row'];
export type DbProfile = {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

// Enhanced types with relations
export interface Schedule extends DbSchedule {
  lesson?: DbLesson;
  bookings?: DbBooking[];
}

// Booking type used in the components
export interface Booking extends DatabaseBooking {
  schedule?: DatabaseLessonSchedule;
  lesson_schedule?: DatabaseLessonSchedule;
  lesson?: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    duration: number;
    image_url: string | null;
  };
  teacher?: Pick<SupabaseUserProfile, 'full_name' | 'avatar_url'>;
  student?: Pick<SupabaseUserProfile, 'full_name' | 'avatar_url'>;
  amount?: number;
}

// Input types for operations
export interface BookingInput {
  scheduleId: string;
  studentId: string;
  amount: number;
  notes?: string;
  metadata?: Record<string, any>;
}

// Filter types
export interface BookingFilter {
  scheduleId?: string;
  studentId?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  studentId?: string;
  teacherId?: string;
}

// Summary and statistics
export interface BookingSummary {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  averageRating: number;
}

// Time and schedule related types
export interface TimeRange {
  start: string; // ISO string
  end: string;   // ISO string
}

export interface WorkHours {
  monday: TimeRange | null;
  tuesday: TimeRange | null;
  wednesday: TimeRange | null;
  thursday: TimeRange | null;
  friday: TimeRange | null;
  saturday: TimeRange | null;
  sunday: TimeRange | null;
}

// Lesson availability
export interface Vacancy {
  id: string;
  lesson_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  lessons?: {
    id: string;
    title: string;
    description: string;
    price: number;
    teacher_id: string;
  };
}

// Additional types needed by components
export interface BookingData extends BaseEntity {
  studentId: string;
  scheduleId: string;
  status: BookingStatus;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface LessonSchedule {
  id: string;
  lesson_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string | null;
  updated_at: string | null;
  metadata?: Record<string, any> | null;
}

// Types needed by hooks
export interface BookedLesson {
  id: string;
  title: string;
  description: string | null;
  teacher_id: string;
  schedule: {
    id: string;
    start_time: string;
    end_time: string;
  };
  teacher: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface BookingRequest {
  id: string;
  student_id: string;
  lesson_schedule_id: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: string;
  student: {
    id: string;
    full_name: string;
    email: string;
  };
  lesson_schedule: {
    id: string;
    start_time: string;
    end_time: string;
    lesson: {
      id: string;
      title: string;
      description: string | null;
    };
  };
}

// Type for booking data from Supabase join query
export interface BookingWithScheduleData {
  id: string;
  student_id: string;
  schedule_id: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  lesson_schedules?: {
    id: string;
    lesson_id: string;
    start_time: string;
    end_time: string;
    is_available: boolean;
    lessons?: {
      id: string;
      title: string;
      description: string | null;
      price: number;
      teacher_id: string;
    };
  } | null;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
} 