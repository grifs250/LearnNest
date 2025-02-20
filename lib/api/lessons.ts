import { db } from "@/lib/firebase/client";
import { collection, getDocs, query, where, Query, CollectionReference, addDoc, Timestamp } from "firebase/firestore";
import { Lesson } from "@/types";

export async function fetchLessons(subjectId?: string): Promise<Lesson[]> {
  let q: Query;

  if (subjectId) {
    q = query(collection(db, "lessons"), where("subjectId", "==", subjectId));
  } else {
    q = collection(db, "lessons") as CollectionReference;
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    bookedTimes: doc.data().bookedTimes || {},
    price: doc.data().price || 0
  })) as Lesson[];
}

export async function createLesson(
  subjectId: string,
  subjectName: string,
  teacherId: string,
  teacherName: string,
  description: string,
  lessonLength: number,
  availableTimes: string[]
) {
  try {
    await addDoc(collection(db, "lessons"), {
      subjectId,
      subjectName,
      teacherId,
      teacherName,
      description,
      lessonLength,
      availableTimes: availableTimes.map((time) => Timestamp.fromDate(new Date(time))),
      bookedBy: null,
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating lesson:", error);
    return { success: false, error };
  }
} 