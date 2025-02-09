export interface FirestoreLesson {
  subject: string;
  description: string;
  teacherName: string;
  teacherId: string;
  date: string;
  time: string;
  bookedBy: string | null;
}

export interface Lesson {
  id: string;
  subject: string;    // Latvian name
  subjectId: string;  // Reference ID
  description: string;
  teacherId: string;
  teacherName: string;
  lessonLength: number;
  bookedTimes: {
    [timeSlot: string]: {
      studentId: string;
      status: 'pending' | 'accepted' | 'rejected';
    };
  };
  category?: string;
}

export interface TimeSlot {
  date: string;
  start: string;
  end: string;
}

export interface LessonData {
  id: string;
  subject: string;
  description: string;
  teacherId: string;
  teacherName: string;
  price: number;
  lessonLength: number;
  bookedTimes: {
    [timeSlot: string]: {
      studentId: string;
      status: 'pending' | 'accepted' | 'rejected';
    };
  };
}

export interface TeacherLesson {
  id: string;
  subject: string;
  teacherId: string;
  status: string;
  date?: string;
  time?: string;
  [key: string]: any;  // For any additional fields
} 