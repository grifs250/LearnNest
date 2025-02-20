import { LESSON_STATUS } from "../constants";

export type BookingStatus = typeof LESSON_STATUS[keyof typeof LESSON_STATUS];

export interface TimeSlot {
  date: string;
  time: string;
}

export interface BookingData {
  lessonId: string;
  studentId: string;
  teacherId: string;
  timeSlot: string;
  status: BookingStatus;
  price: number;
  lessonLength: number;
  bookedAt: string;
} 