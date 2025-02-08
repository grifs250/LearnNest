"use server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function fetchCategories() {
  const snapshot = await adminDb.collection("subjects").get();
  const subjects = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Group subjects by category
  const groupedSubjects = subjects.reduce((acc, subject) => {
    const category = subject.category;
    if (!acc[category]) {
      acc[category] = {
        id: category,
        name: getCategoryName(category),
        subjects: []
      };
    }
    acc[category].subjects.push({
      id: subject.id,
      name: subject.name,
      categoryId: category
    });
    return acc;
  }, {} as Record<string, any>);

  return Object.values(groupedSubjects);
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    subjects: "Mācību priekšmeti",
    languages: "Valodas",
    it: "IT kursi"
  };
  return names[category] || category;
} 