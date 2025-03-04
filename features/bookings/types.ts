import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import {
  Booking as DbOriginalBooking,
  BookingStatus as DbOriginalBookingStatus,
  PaymentStatus as DbOriginalPaymentStatus,
  LessonSchedule as DbOriginalLessonSchedule,
  UserProfile as DbOriginalUserProfile
} from '@/types/database';

// Re-export base types
export type { 
  Database
};

// Define Database types with renamed imports to avoid conflicts
export type DatabaseBooking = DbOriginalBooking;
export type DatabaseBookingStatus = DbOriginalBookingStatus;
export type DatabasePaymentStatus = DbOriginalPaymentStatus;
export type DatabaseLessonSchedule = DbOriginalLessonSchedule;
export type SupabaseUserProfile = DbOriginalUserProfile;

// Define local types for this feature
export type LocalBookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'canceled' | 'completed';
export type LocalPaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

// Type aliases for database tables
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

// Base entity interface
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string | null;
}

export interface Schedule extends DbSchedule {
  lesson?: DbLesson;
  bookings?: DbBooking[];
}

// Main booking interface with all necessary properties
export interface LocalBooking extends DatabaseBooking {
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
  booking_time?: string;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  lessons?: {
    id: string;
    title: string;
    description: string | null;
    price: number;
  };
}

export interface BookingInput {
  scheduleId: string;
  studentId: string;
  amount: number;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface BookingFilter {
  scheduleId?: string;
  studentId?: string;
  status?: LocalBookingStatus;
  startDate?: string;
  endDate?: string;
}

export interface BookingFilters {
  status?: LocalBookingStatus;
  paymentStatus?: LocalPaymentStatus;
  startDate?: string;
  endDate?: string;
  studentId?: string;
  teacherId?: string;
}

export interface BookingSummary {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  averageRating: number;
}

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

export interface BookingData extends BaseEntity {
  studentId: string;
  scheduleId: string;
  status: LocalBookingStatus;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface LocalLessonSchedule {
  id: string;
  lesson_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string | null;
  updated_at: string | null;
  metadata?: Record<string, any> | null;
}

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
  status: LocalBookingStatus;
  payment_status: LocalPaymentStatus;
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

export interface BookingWithScheduleData {
  id: string;
  student_id: string;
  schedule_id: string;
  status: LocalBookingStatus;
  payment_status: LocalPaymentStatus;
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