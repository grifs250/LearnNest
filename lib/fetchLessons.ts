import { db } from "@/lib/firebaseClient";
import { collection, getDocs, query, where, Query, CollectionReference } from "firebase/firestore";

export async function fetchLessons(subjectId?: string) {
  let q: Query; // Pareizi definējam q kā Query tipu

  if (subjectId) {
    q = query(collection(db, "lessons"), where("subjectId", "==", subjectId)); // Kad ir subjectId, izmantojam query()
  } else {
    q = collection(db, "lessons") as CollectionReference; // Kad nav subjectId, atstājam kā CollectionReference
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    bookedTimes: doc.data().bookedTimes || {},
    price: doc.data().price || 0
  })) as {
    id: string;
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
    description: string;
    lessonLength: number;
    availableTimes: string[];
    bookedBy: string | null;
    bookedTimes: Record<string, any>;
    price: number;
  }[];
}
