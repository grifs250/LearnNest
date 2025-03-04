import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase.types';

type DbLesson = Database['public']['Tables']['lessons']['Row'];

export const lessonService = {
  async getLessons(): Promise<DbLesson[]> {
    const supabase = await createServerSupabaseClient();
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
    const supabase = await createServerSupabaseClient();
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
    const supabase = await createServerSupabaseClient();
    
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
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('lessons')
      .insert(lessonData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLesson(id: string, updates: Partial<DbLesson>): Promise<DbLesson> {
    const supabase = await createServerSupabaseClient();
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
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async fetchLessonAndTeacher(lessonId: string): Promise<{lesson: DbLesson; teacherData: any}> {
    const supabase = await createServerSupabaseClient();
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