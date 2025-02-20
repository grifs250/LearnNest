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

export interface BookingAction {
  vacancyId: string;
  onSuccess?: () => void;
}

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'paid';

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

export interface StudentBookingsProps {
  readonly userId: string;
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
  readonly teacherId: string;
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