import { BaseEntity } from '@/features/shared/types';
import { User } from '@/features/auth/types';
import { Lesson } from '@/features/lessons/types';
import type { Review } from '@/features/reviews/types';

export interface Schedule extends BaseEntity {
  lessonId: string;
  lesson?: Lesson;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  metadata?: Record<string, any>;
}

export interface Booking extends BaseEntity {
  scheduleId: string;
  schedule?: Schedule;
  studentId: string;
  student?: User;
  status: BookingStatus;
  notes?: string;
  metadata?: Record<string, any>;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface BookingInput {
  scheduleId: string;
  studentId: string;
  notes?: string;
  metadata?: Record<string, any>;
}

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

export interface BookingSummary {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  averageRating: number;
}

export interface Vacancy extends BaseEntity {
  title: string;
  description: string;
  bookedBy?: string;
  bookedAt?: string;
  // Add any other relevant fields
}

export interface BookingData extends BaseEntity {
  studentId: string;
  scheduleId: string;
  status: BookingStatus;
  notes?: string;
  metadata?: Record<string, any>;
} 