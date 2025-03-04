import { 
  Booking, 
  BookingStatus, 
  BookingWithDetails,
  Lesson, 
  LessonSchedule, 
  PaymentStatus, 
  UserProfile,
  StudentProfile,
  TeacherProfile
} from '@/types/database';
import type { Database } from '@/lib/types/supabase';

// Re-export base types
export type {
  Booking,
  BookingStatus,
  BookingWithDetails,
  Lesson,
  LessonSchedule,
  PaymentStatus,
  UserProfile,
  StudentProfile,
  TeacherProfile
};

// Database row types
export type DbBooking = Database['public']['Tables']['bookings']['Row'];
export type DbLessonSchedule = Database['public']['Tables']['lesson_schedules']['Row'];

// Booking feature-specific types
export type BookingFormData = {
  lesson_id: string;
  schedule_id: string;
  notes?: string;
};

export interface BookingFilter {
  student_id?: string;
  teacher_id?: string;
  date_range?: { start: string; end: string };
  status?: BookingStatus;
  payment_status?: PaymentStatus;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface AvailabilityCalendar {
  dates: Array<{
    date: string;
    slots: TimeSlot[];
  }>;
}

export interface BookingSummary {
  totalBookings: number;
  upcoming: number;
  past: number;
  cancelled: number;
  totalPaid: number;
  totalRefunded: number;
  recentBookings: Array<Booking>;
}

export type BookingUpdateData = {
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  notes?: string;
  meeting_url?: string;
};

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
}

export type PaymentMethod = 'card' | 'bank_transfer' | 'paypal'; 