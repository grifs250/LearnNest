import { supabase } from '@/lib/supabase/db';
import { Subject, Category } from '@/features/lessons/types';

export async function fetchSubjects(): Promise<Subject[]> {
  try {
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('id, name, slug, description, parent_id, is_active, created_at, updated_at, category_id');

    if (error) throw error;

    return subjects;
  } catch (error) {
    console.error('Error fetching subjects:', (error as any).message || error);
    return [];
  }
}

export async function fetchCategoriesWithSubjects(): Promise<{ category: Category; subjects: Subject[] }[]> {
  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select('*, subjects(*)');

  if (categoryError) throw categoryError;

  return categories.map(category => ({
    category,
    subjects: category.subjects || []
  }));
} 