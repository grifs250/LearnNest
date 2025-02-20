/**
 * Base types and interfaces used across the application
 */

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'paid';

export interface TimeRange {
  start: string;  // Format: "HH:mm"
  end: string;    // Format: "HH:mm"
}

export interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeRange[];
}

export interface WorkHours {
  [key: number]: DaySchedule;  // key is 0-6 representing days of week
}

export interface BaseUserFields {
  id: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface BaseLessonFields {
  id: string;
  subject: string;
  subjectId: string;
  description: string;
  teacherId: string;
  teacherName: string;
  lessonLength: number; // in minutes
  category?: string;
  price: number;
} 