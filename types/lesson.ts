// Base interface for common lesson fields
interface BaseLessonFields {
  id: string;
  subject: string;
  subjectId: string;
  description: string;
  teacherId: string;
  teacherName: string;
  lessonLength: number; // in minutes
  category?: string;
}

// Booking status type used throughout the application
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'paid';

// Booking data structure as stored in Firestore
export interface BookedTimeData {
  studentId: string;
  status: BookingStatus;
}

// The lesson data as stored in Firestore
export interface FirestoreLesson extends BaseLessonFields {
  bookedTimes: {
    [timeSlot: string]: {
      studentId: string;
      studentName: string;
      status: BookingStatus;
      bookedAt: string;
      lessonId: string;
      subject: string;
      teacherId: string;
      teacherName: string;
      timeSlot: string;
    } | null;
  };
  price?: number;
}

// The lesson data as used in the application
export interface Lesson extends BaseLessonFields {
  price: number;
  bookedTimes: FirestoreLesson['bookedTimes']; // Reuse the same type
  category?: string;
}

// Type for creating a new lesson
export interface CreateLessonInput extends Omit<BaseLessonFields, 'id'> {
  description: string;
  lessonLength: number;
  bookedTimes?: Record<string, never>; // Empty object for initial creation
}

// Type for lesson booking request
export interface LessonBookingRequest {
  lessonId: string;
  studentId: string;
  timeSlot: string; // Format: "YYYY-MM-DDTHH:mm"
}

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

export interface Teacher {
  displayName: string;
  email: string;
  description?: string;
  education?: string;
  experience?: string;
  workHours: WorkHours;
}

export interface BookingData {
  lessonId: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  timeSlot: string;
  status: BookingStatus;
  bookedAt: string;
  lessonLength: number;
  price: number;
  category?: string;
  subjectId?: string;
} 