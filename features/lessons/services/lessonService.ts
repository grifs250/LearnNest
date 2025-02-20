import { db } from "@/lib/firebase/client";
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, runTransaction } from "firebase/firestore";
import { Lesson, BookingStatus, TeacherData } from "../types";

export const lessonService = {
  async fetchLessonsBySubject(subjectId: string): Promise<Lesson[]> {
    const q = query(
      collection(db, "lessons"),
      where("subjectId", "==", subjectId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Lesson));
  },

  async getLessonById(lessonId: string): Promise<Lesson | null> {
    const docRef = doc(db, "lessons", lessonId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Lesson : null;
  },

  async createLesson(lessonData: Omit<Lesson, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "lessons"), lessonData);
    return docRef.id;
  },

  async updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<void> {
    await updateDoc(doc(db, "lessons", lessonId), updates);
  },

  async fetchLessonAndTeacher(lessonId: string): Promise<{lesson: Lesson; teacherData: TeacherData}> {
    const lessonRef = doc(db, "lessons", lessonId);
    const lessonSnap = await getDoc(lessonRef);
    
    if (!lessonSnap.exists()) {
      throw new Error("Lesson not found");
    }

    const lessonData = lessonSnap.data();
    const teacherRef = doc(db, "users", lessonData.teacherId);
    const teacherSnap = await getDoc(teacherRef);
    
    if (!teacherSnap.exists()) {
      throw new Error("Teacher not found");
    }

    return {
      lesson: {
        id: lessonSnap.id,
        ...lessonData
      } as Lesson,
      teacherData: teacherSnap.data() as TeacherData
    };
  },

  async createBooking(lessonId: string, timeSlot: string, userId: string, userData: any): Promise<void> {
    await runTransaction(db, async (transaction) => {
      const lessonRef = doc(db, "lessons", lessonId);
      const lessonDoc = await transaction.get(lessonRef);
      
      if (!lessonDoc.exists()) {
        throw new Error("Lesson not found");
      }

      // Add booking logic here
      // ... (keep existing booking logic from LessonDetails component)
    });
  }
}; 