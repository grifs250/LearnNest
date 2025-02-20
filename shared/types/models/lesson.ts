import type { BaseLessonFields, BookingStatus } from './base';

export interface BookedTimeData {
  studentId: string;
  studentName: string;
  status: BookingStatus;
  bookedAt: string;
  lessonId: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  timeSlot: string;
}

export interface FirestoreLesson extends BaseLessonFields {
  bookedTimes: {
    [timeSlot: string]: BookedTimeData | null;
  };
}

export interface Lesson extends BaseLessonFields {
  bookedTimes: FirestoreLesson['bookedTimes'];
}

export interface CreateLessonInput extends Omit<BaseLessonFields, 'id'> {
  bookedTimes?: Record<string, never>; // Empty object for initial creation
}

export interface LessonBookingRequest {
  lessonId: string;
  studentId: string;
  timeSlot: string; // Format: "YYYY-MM-DDTHH:mm"
}

export interface BookingData extends BookedTimeData {
  lessonLength: number;
  price: number;
  category?: string;
  subjectId?: string;
} 