/** Represents a booking time slot that is available */
export interface Vacancy {
  id: string;
  subject: string;
  description: string;
  teacherName: string;
  date: string;
  time: string;
  bookedBy?: string;
  canceledAt?: string;
}

/** Action for booking operations */
export interface BookingAction {
  vacancyId: string;
  onSuccess?: () => void;
}

/** Status of a booking */
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'paid';

/** Represents a booked lesson with its details */
export interface BookedLesson {
  id: string;
  lessonId: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  date: string;
  time: string;
  status: BookingStatus;
  lessonLength: number;
  bookedAt: string;
  paid?: boolean;
  price?: number;
  category?: string;
  subjectId?: string;
}

/** Props for student bookings component */
export interface StudentBookingsProps {
  userId: string;
}

export interface BookingRequest {
  id: string;
  lessonId: string;
  subject: string;
  userId: string;
  userName: string;
  studentId?: string;  // Add optional legacy fields
  studentName?: string;
  date: string;
  time: string;
  status: BookingStatus;
  bookedAt: string;
  price?: number;
  lessonLength?: number;
}

export interface TeacherBookingsProps {
  teacherId: string;
}

export interface BookedTimeData {
  studentId: string;
  status: BookingStatus;
}

export interface LessonData {
  subject: string;
  teacherId: string;
  bookedTimes: {
    [timeSlot: string]: BookedTimeData;
  };
}

export interface Booking {
  id: string;
  studentId: string;
  teacherId: string;
  lessonId: string;
  subject: string;
  teacherName: string;
  studentName: string;
  date: string;
  time: string;
  status: BookingStatus;
} 