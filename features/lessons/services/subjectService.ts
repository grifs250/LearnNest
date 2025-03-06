'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Subject } from '@/types/models';
import type { Category } from '../types';

interface LessonCount {
  subject_id: string;
  count: string; // PostgreSQL count returns a string
}

/**
 * Fetch all active subjects with their categories and lesson counts
 */
export async function fetchSubjects(): Promise<Subject[]> {
  const supabase = await createServerSupabaseClient();
  
  // First, get all subjects with their categories
  const { data: subjects, error } = await supabase
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

  // Now get lesson counts for each subject using a raw query
  const { data: lessonCounts, error: countError } = await supabase
    .rpc('get_lesson_counts_by_subject');

  if (countError) {
    console.error('Error fetching lesson counts:', countError);
  }

  // Create a lookup map for lesson counts from RPC
  const countMap = new Map<string, number>();
  if (lessonCounts) {
    lessonCounts.forEach((item: LessonCount) => {
      countMap.set(item.subject_id, parseInt(item.count));
    });
  }

  // Enrich subject data with lesson counts from both sources
  const enrichedSubjects = subjects.map(subject => {
    // Check both sources for lesson count:
    // 1. From RPC function
    const rpcCount = countMap.get(subject.id) || 0;
    
    // 2. From metadata - this is our backup source
    const metadataCount = subject.metadata?.lesson_count 
      ? parseInt(subject.metadata.lesson_count.toString()) 
      : 0;
    
    // Use the RPC count if available, otherwise use metadata
    const finalCount = rpcCount > 0 ? rpcCount : metadataCount;
    
    return {
      ...subject,
      lesson_count: finalCount
    };
  });

  return enrichedSubjects as Subject[];
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

  // Get lesson count for this subject using a simpler query
  const { count, error: countError } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('subject_id', id)
    .eq('is_active', true);

  if (countError) {
    console.error('Error fetching lesson count:', countError);
  }

  // Also check metadata if available
  const metadataCount = data.metadata?.lesson_count 
    ? parseInt(data.metadata.lesson_count.toString()) 
    : 0;

  // Use count from query if available, otherwise use metadata
  const finalCount = count !== null ? count : metadataCount;

  // Enrich subject with lesson count
  const enrichedSubject = {
    ...data,
    lesson_count: finalCount
  };

  return enrichedSubject as Subject;
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