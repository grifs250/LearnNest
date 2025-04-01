'use server';

import { createServerClient } from '@/lib/supabase/server';
import type { Subject, CategoryWithSubjects } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

interface LessonCount {
  subject_id: string;
  count: string; // PostgreSQL count returns a string
}

// Create a direct client to avoid dependency issues during fetching
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Supabase config:', { 
  url: supabaseUrl ? 'Set' : 'Not set',
  key: supabaseAnonKey ? 'Set' : 'Not set' 
});

// Create a more reliable client for server-side
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

/**
 * Fetches all subjects from the database
 * 
 * @returns {Promise<Subject[]>} List of all subjects
 */
export async function fetchSubjects(): Promise<Subject[]> {
  try {
    console.log('Fetching subjects...');
    
    // Fetch all subjects with their categories
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        category:categories(*)
      `)
      .order('name');
      
    if (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Unexpected error in fetchSubjects:', err);
    return [];
  }
}

/**
 * Fetches subjects grouped by category
 * 
 * @returns {Promise<CategoryWithSubjects[]>} List of categories with their subjects
 */
export async function fetchSubjectsByCategory(): Promise<CategoryWithSubjects[]> {
  const supabase = await createServerClient();
  
  try {
    // First, get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (categoriesError) {
      console.error('Error fetching categories (detailed):', {
        message: categoriesError.message,
        code: categoriesError.code,
        details: categoriesError.details,
        hint: categoriesError.hint
      });
      return [];
    }
    
    if (!categories || categories.length === 0) {
      console.log('No categories found');
      return [];
    }
    
    // Then get all subjects
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (subjectsError) {
      console.error('Error fetching subjects for categories (detailed):', {
        message: subjectsError.message,
        code: subjectsError.code,
        details: subjectsError.details,
        hint: subjectsError.hint
      });
      
      // Return categories without subjects
      return categories.map(category => ({
        ...category,
        subjects: []
      }));
    }
    
    if (!subjects || subjects.length === 0) {
      console.log('No subjects found');
      // Return categories without subjects
      return categories.map(category => ({
        ...category,
        subjects: []
      }));
    }
    
    // Group subjects by category
    const categoriesWithSubjects = categories.map(category => {
      const categorySubjects = subjects.filter(
        subject => subject.category_id === category.id
      );
      
      return {
        ...category,
        subjects: categorySubjects
      };
    });
    
    return categoriesWithSubjects;
  } catch (error) {
    console.error('Unexpected error in fetchSubjectsByCategory:', error);
    return [];
  }
}

/**
 * Fetches a subject by its ID
 * 
 * @param {string} id - The subject ID
 * @returns {Promise<Subject | null>} The subject or null if not found
 */
export async function fetchSubjectById(id: string): Promise<Subject | null> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching subject by ID:', error);
    return null;
  }
  
  return data;
}

/**
 * Fetches subjects by category ID
 * 
 * @param {string} categoryId - The category ID to filter by
 * @returns {Promise<Subject[]>} List of subjects in the category
 */
export async function fetchSubjectsByCategoryId(categoryId: string): Promise<Subject[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
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
export async function fetchCategoriesWithSubjects(): Promise<{ category: CategoryWithSubjects; subjects: Subject[] }[]> {
  const supabase = await createServerClient();
  
  // Get all categories with their subjects in a single query
  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select(`
      *,
      subjects:subjects(*)
    `)
    .eq('is_active', true)
    .order('name');
  
  if (categoryError) {
    console.error('Error fetching categories with subjects:', categoryError);
    return [];
  }
  
  // Transform the data to match the expected return type
  return categories.map(category => ({
    category: {
      ...category,
      subjects: category.subjects || []
    },
    subjects: category.subjects || []
  }));
}

/**
 * Get all subjects with full category details
 */
export async function getAllSubjects(): Promise<Subject[]> {
  const supabase = await createServerClient();
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
  const supabase = await createServerClient();
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

/**
 * Fetches subjects with their lesson counts
 * @returns {Promise<Subject[]>} - Subjects with lesson counts
 */
export async function fetchSubjectsWithLessonCounts(): Promise<Subject[]> {
  try {
    console.log('Fetching subjects with lesson counts...');
    
    // 1. Get all subjects with their categories (including inactive ones)
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select(`
        *,
        category:categories(*)
      `)
      .order('name');
    
    if (subjectsError) {
      console.error('Error fetching subjects with categories:', subjectsError);
      return [];
    }
    
    console.log(`Retrieved ${subjects?.length || 0} subjects from database`);
    
    // 2. Get active lessons count for each subject using admin client
    // This bypasses RLS as lessons should be publicly viewable
    const adminClient = createSupabaseAdminClient();
    const { data: lessonsData, error: lessonsError } = await adminClient
      .from('lessons')
      .select('subject_id, id')
      .eq('is_active', true);
    
    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      // Continue even with error - we'll just show subjects without lesson counts
      // This ensures users can still see subjects even if lesson counts are unavailable
    }
    
    const activeLessons = lessonsData || [];
    console.log(`Retrieved ${activeLessons.length} active lessons`);
    
    // 3. Count lessons per subject
    const subjectLessonCounts = new Map<string, number>();
    
    activeLessons.forEach(lesson => {
      const subjectId = lesson.subject_id;
      
      if (!subjectLessonCounts.has(subjectId)) {
        subjectLessonCounts.set(subjectId, 0);
      }
      
      subjectLessonCounts.set(
        subjectId, 
        subjectLessonCounts.get(subjectId)! + 1
      );
    });
    
    // 4. Add lesson counts and has_lessons flag to subjects
    const enhancedSubjects = subjects?.map(subject => ({
      ...subject,
      lesson_count: subjectLessonCounts.get(subject.id) || 0,
      has_lessons: subjectLessonCounts.has(subject.id) && 
                  subjectLessonCounts.get(subject.id)! > 0
    }));
    
    console.log(`Enhanced ${enhancedSubjects?.length || 0} subjects with lesson counts`);
    console.log(`Subjects with lessons: ${subjectLessonCounts.size}`);
    
    return enhancedSubjects || [];
  } catch (error) {
    console.error('Error in fetchSubjectsWithLessonCounts:', error);
    return [];
  }
} 