"use server";
import { adminDb } from "@/lib/firebase/admin";
import { Category, Subject } from "@/types";

interface SubjectData {
  id: string;
  name: string;
  category: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const snapshot = await adminDb.collection("subjects").get();
  const subjects = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as SubjectData[];

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
  }, {} as Record<string, Category>);

  return Object.values(groupedSubjects);
}

function getCategoryName(categoryId: string): string {
  const categoryNames: Record<string, string> = {
    subjects: "Mācību priekšmeti",
    languages: "Valodas",
    music: "Mūzika",
    art: "Māksla",
    sports: "Sports",
  };
  return categoryNames[categoryId] || categoryId;
} 