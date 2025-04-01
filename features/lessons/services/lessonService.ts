import { createServerClient } from '@/lib/supabase/server';
import type { Lesson, LessonWithProfile, Database } from '@/lib/types';

/**
 * Fetches all published lessons
 * 
 * @returns {Promise<Lesson[]>} List of all published lessons
 */
export async function fetchLessons(): Promise<Lesson[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
  
  return data;
}

/**
 * Fetches lessons with teacher profile information
 * 
 * @returns {Promise<LessonWithProfile[]>} List of lessons with teacher profiles
 */
export async function fetchLessonsWithProfiles(): Promise<LessonWithProfile[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('lessons_with_profiles')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching lessons with profiles:', error);
    return [];
  }
  
  return data;
}

/**
 * Fetches a lesson by its ID
 * 
 * @param {string} id - The lesson ID
 * @returns {Promise<Lesson | null>} The lesson or null if not found
 */
export async function fetchLessonById(id: string): Promise<Lesson | null> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching lesson by ID:', error);
    return null;
  }
  
  return data;
}

/**
 * Fetches lessons by subject ID
 * 
 * @param {string} subjectId - The subject ID
 * @returns {Promise<Lesson[]>} List of lessons for the subject
 */
export async function fetchLessonsBySubject(subjectId: string): Promise<Lesson[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching lessons by subject:', error);
    return [];
  }
  
  return data;
}

/**
 * Fetches lessons by teacher ID
 * 
 * @param {string} teacherId - The teacher ID
 * @returns {Promise<Lesson[]>} List of lessons by the teacher
 */
export async function fetchLessonsByTeacher(teacherId: string): Promise<Lesson[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching lessons by teacher:', error);
    return [];
  }
  
  return data;
}

/**
 * Fetches featured lessons
 * 
 * @param {number} limit - Maximum number of lessons to fetch
 * @returns {Promise<Lesson[]>} List of featured lessons
 */
export async function fetchFeaturedLessons(limit: number = 6): Promise<Lesson[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching featured lessons:', error);
    return [];
  }
  
  return data;
}

/**
 * Fetches recently added lessons
 * 
 * @param {number} limit - Maximum number of lessons to fetch
 * @returns {Promise<Lesson[]>} List of recent lessons
 */
export async function fetchRecentLessons(limit: number = 6): Promise<Lesson[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching recent lessons:', error);
    return [];
  }
  
  return data;
}

type DbLesson = Database['public']['Tables']['lessons']['Row'];

export const lessonService = {
  async getLessons(): Promise<DbLesson[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        teacher:profiles!teacher_id(*),
        subject:subjects(*)
      `)
      .eq('is_active', true);

    if (error) throw error;
    return data;
  },

  async getLesson(id: string): Promise<DbLesson> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        teacher:profiles!teacher_id(*),
        subject:subjects(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async fetchLessonsBySubject(category: string): Promise<DbLesson[]> {
    const supabase = await createServerClient();
    
    // First, get all subject IDs in the given category
    const { data: subjectIds, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('category', category);
    
    if (subjectError) throw subjectError;
    
    if (!subjectIds || subjectIds.length === 0) {
      return [];
    }
    
    // Now get all lessons with those subject IDs
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        teacher:profiles!teacher_id(*),
        subject:subjects(*)
      `)
      .eq('is_active', true)
      .in('subject_id', subjectIds.map(s => s.id));

    if (error) throw error;
    return data || [];
  },

  async createLesson(lessonData: Omit<DbLesson, 'id' | 'created_at' | 'updated_at'>): Promise<DbLesson> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('lessons')
      .insert(lessonData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLesson(id: string, updates: Partial<DbLesson>): Promise<DbLesson> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLesson(id: string): Promise<void> {
    const supabase = await createServerClient();
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async fetchLessonAndTeacher(lessonId: string): Promise<{lesson: DbLesson; teacherData: any}> {
    const supabase = await createServerClient();
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (lessonError) throw lessonError;

    const { data: teacherData, error: teacherError } = await supabase
      .from('users')
      .select('*')
      .eq('id', lessonData.teacherId)
      .single();

    if (teacherError) throw teacherError;

    return {
      lesson: { id: lessonId, ...lessonData } as DbLesson,
      teacherData: teacherData
    };
  },

  async createBooking(lessonId: string, timeSlot: string, userId: string, userData: any): Promise<void> {
    // Implement booking logic using Supabase
    // This will require additional logic based on your booking structure
  }
}; 