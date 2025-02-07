"use server";
import { adminDb } from "@/lib/firebaseAdmin";

// ✅ Ensure it's not used in client components
export async function fetchSubjects() {
   // Next.js App Router (Ensures server execution)
  
  const snapshot = await adminDb.collection("subjects").get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as { id: string; name: string; category: string }[];
}
