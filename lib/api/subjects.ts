"use server";
import { adminDb } from "@/lib/firebase/admin";
import { Subject } from "@/types";

export async function fetchSubjects(): Promise<Subject[]> {
  const snapshot = await adminDb.collection("subjects").get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Subject[];
} 