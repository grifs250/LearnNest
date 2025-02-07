import { db } from "@/lib/firebaseClient";
import { collection, addDoc, Timestamp } from "firebase/firestore";

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
      lessonLength, // in minutes
      availableTimes: availableTimes.map((time) => Timestamp.fromDate(new Date(time))),
      bookedBy: null,
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating lesson:", error);
    return { success: false, error };
  }
}
