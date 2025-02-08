export interface FirestoreLesson {
  subject: string;
  description: string;
  teacherName: string;
  teacherId: string;
  date: string;
  time: string;
  bookedBy: string | null;
}

export interface Lesson extends FirestoreLesson {
  id: string;
} 