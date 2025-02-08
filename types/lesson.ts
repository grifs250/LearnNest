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