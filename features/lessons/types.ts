// import { User } from '@/features/auth/types';

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface CourseSectionsProps {
  readonly categories: Category[];
}

export const CATEGORY_NAMES: Record<string, string> = {
  'subjects': 'Mācību priekšmeti',
  'languages': 'Valodu kursi',
  'itCourses': 'IT kursi'
};

export interface Lesson {
  id: string;
  subject: string;
  description?: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  category?: string;
  price?: number;
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus = 'pending' | 'accepted' | 'rejected';

export interface StudentLesson {
  id: string;
  subject: string;
  teacherName: string;
  teacherId: string;
  date: string;
  time: string;
  status: BookingStatus;
  availableTimes?: string[];
  category?: string;
  subjectId?: string;
}

export interface TeacherData {
  workHours?: {
    [date: string]: string[];
  };
}

export interface BookedTimeData {
  studentId: string;
  status: BookingStatus;
}

export interface LessonData {
  subject: string;
  teacherId: string;
  teacherName: string;
  category: string;
  subject_id: string;
  bookedTimes: {
    [timeSlot: string]: BookedTimeData;
  };
  studentId?: string;
}

export interface StudentLessonsProps {
  readonly studentId: string;
} 