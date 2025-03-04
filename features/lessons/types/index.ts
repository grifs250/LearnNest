import type { User } from '@/features/auth/types/types';
import { Database } from '@/lib/types/supabase';
import type {
  Lesson,
  LessonSchedule,
  Booking,
  Category,
  Subject,
  UserProfile,
  BookingStatus,
  PaymentStatus,
  LessonWithSchedule,
  BookingWithDetails,
  TeacherProfile,
  StudentProfile
} from '@/types/database';

// Type aliases for specific features
export type LessonWithProfile = Lesson & {
  teacher: UserProfile;
};

export type BookingWithProfiles = Booking & {
  student: UserProfile;
  teacher: UserProfile;
  lesson: Lesson;
  schedule: LessonSchedule;
};

// Direct database types
export type DbLesson = Database['public']['Tables']['lessons']['Row'];
export type DbSchedule = Database['public']['Tables']['lesson_schedules']['Row'];
export type DbBooking = Database['public']['Tables']['bookings']['Row'];
// Using UserProfile instead of separate profile tables
export type DbProfile = UserProfile; // Compatibility alias
export type DbTeacherProfile = UserProfile; // Compatibility alias
export type DbSubject = Database['public']['Tables']['subjects']['Row'];

// Re-export base types
export type { 
  Lesson,
  LessonSchedule,
  Booking,
  Category,
  Subject,
  UserProfile,
  BookingStatus,
  PaymentStatus,
  LessonWithSchedule,
  BookingWithDetails,
  TeacherProfile,
  StudentProfile
};

// Feature-specific types
export type LessonStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';

export interface TimeSlot {
  date: string;  // ISO date string
  time: string;  // 24-hour format HH:mm
}

export interface BookingData {
  lesson_id: string;
  student_id: string;
  teacher_id: string;
  time_slot: string;  // Combined date and time in ISO format
  status: LessonStatus;
  price: number;
  duration: number;
  booked_at: string;  // ISO date string
  subject?: string;
  teacher_name?: string;
}

export interface TeacherMetadata {
  [key: string]: any;
  education?: string;
  experience?: string;
  workHours?: {
    [key: string]: {
      enabled: boolean;
      timeSlots: Array<{
        start: string;
        end: string;
      }>;
    };
  };
}

export interface TeacherData {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  hourly_rate: number;
  rating?: number;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface WorkHours {
  [day: string]: {
    start: string;
    end: string;
    breaks?: Array<{ start: string; end: string }>;
  };
}

export interface LessonFilters {
  teacherId?: string;
  subjectId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface LessonSummary {
  totalLessons: number;
  activeLessons: number;
  totalTeachers: number;
  averagePrice: number;
  popularLessons: Array<{
    id: string;
    title: string;
    bookingCount: number;
  }>;
}

export type LessonFilterParams = {
  category?: string;
  subjectId?: string;
  price_min?: number;
  price_max?: number;
  date_start?: string;
  date_end?: string;
  teacher_id?: string;
  is_active?: boolean;
  search?: string;
};

export interface LessonFormData {
  title: string;
  description: string;
  price: number;
  duration: number;
  subject_id: string;
}

export type ScheduleFormData = {
  start_time: string;
  end_time: string;
  is_available: boolean;
};

export type AvailabilityDay = {
  date: string;
  available_slots: {
    id: string;
    start: string;
    end: string;
    is_available: boolean;
  }[];
};

export type TeacherAvailability = {
  teacherId: string;
  availability: AvailabilityDay[];
};

export interface BookingFormData {
  lesson_id: string;
  schedule_id: string;
  message?: string;
} 