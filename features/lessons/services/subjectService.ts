'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Subject } from '@/types/models';
import type { Category } from '../types';

/**
 * Fetch all active subjects with their categories
 */
export async function fetchSubjects(): Promise<Subject[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('subjects')
    .select(`
      *,
      category:categories(
        id,
        name,
        description
      )
    `)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }

  return data as Subject[];
}

/**
 * Fetch a single subject by ID
 */
export async function fetchSubjectById(id: string): Promise<Subject | null> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('subjects')
    .select(`
      *,
      category:categories(
        id,
        name,
        description
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching subject:', error);
    return null;
  }

  return data as Subject;
}

/**
 * Fetch subjects by category ID
 */
export async function fetchSubjectsByCategory(categoryId: string): Promise<Subject[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('subjects')
    .select(`
      *,
      category:categories(
        id,
        name,
        description
      )
    `)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching subjects by category:', error);
    return [];
  }

  return data as Subject[];
}

/**
 * Fetch categories with their subjects
 */
export async function fetchCategoriesWithSubjects(): Promise<{ category: Category; subjects: Subject[] }[]> {
  const supabase = await createServerSupabaseClient();
  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select('*, subjects(*)');

  if (categoryError) {
    console.error('Error fetching categories with subjects:', categoryError);
    return [];
  }

  return categories.map(category => ({
    category,
    subjects: category.subjects || []
  }));
}

/**
 * Get all subjects with full category details
 */
export async function getAllSubjects(): Promise<Subject[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('subjects')
    .select(`
      *,
      category:categories(*)
    `);

  if (error) {
    console.error('Error fetching all subjects:', error);
    return [];
  }

  return data as Subject[];
}

/**
 * Get subject by ID with full category details
 */
export async function getSubjectById(id: string): Promise<Subject | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('subjects')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching subject by ID:', error);
    return null;
  }

  return data as Subject;
} 