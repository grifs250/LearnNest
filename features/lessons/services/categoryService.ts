import { adminDb } from "@/lib/firebase/admin";
import { DocumentData } from 'firebase-admin/firestore';
import { Category, Subject } from "../types/category";

export async function fetchCategories(): Promise<Category[]> {
  try {
    // Get categories
    const categoriesSnapshot = await adminDb.collection('categories').get();
    const categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      subjects: [] as Subject[]
    }));

    // Get subjects for each category
    const subjectsSnapshot = await adminDb.collection('subjects').get();
    const subjects = subjectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Subject[];

    // Assign subjects to their categories
    return categories.map(category => ({
      ...category,
      subjects: subjects.filter(subject => subject.categoryId === category.id)
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
} 