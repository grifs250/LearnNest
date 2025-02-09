export interface ProfileData {
  uid: string;
  displayName: string;
  about?: string;
  isTeacher: boolean;
}

export interface Lesson {
  id: string;
  subject: string;
  description: string;
  teacherId: string;
  teacherName: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  studentId?: string;
  studentName?: string;
}

export interface LessonData {
  id: string;
  subject: string;
  description?: string;
  date: string;
  time: string;
  teacherId: string;
  teacherName: string;
  studentId?: string;
  studentName?: string;
  status: 'pending' | 'accepted' | 'rejected';
} 