import type { User } from '@/features/auth/types';
import type { Subject } from '@/features/categories/types';

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

export interface Lesson {
  id: string;
  teacher_id: string;
  subject_id: string;
  title: string;
  description: string;
  duration: number;
  max_students: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  teacher?: User;
  subject?: Subject;
  booked_times?: {
    [timeSlot: string]: {
      student_id: string;
      status: LessonStatus;
      booked_at: string;
    };
  };
}

export interface LessonSchedule {
  id: string;
  lesson_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  lesson?: Lesson;
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