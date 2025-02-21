import { supabase } from '@/lib/supabase/db';
import { Lesson, BookingStatus, TeacherData } from "../types";

export const lessonService = {
  async fetchLessonsBySubject(subject_id: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('subject_id', subject_id);

    if (error) throw error;
    return data as Lesson[];
  },

  async getLessonById(lessonId: string): Promise<Lesson | null> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error) throw error;
    return data as Lesson;
  },

  async createLesson(lessonData: Omit<Lesson, "id">): Promise<string> {
    const { data, error } = await supabase
      .from('lessons')
      .insert(lessonData)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateLesson(lessonId: string, updates: Partial<Lesson>): Promise<void> {
    const { error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', lessonId);

    if (error) throw error;
  },

  async fetchLessonAndTeacher(lessonId: string): Promise<{lesson: Lesson; teacherData: TeacherData}> {
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
      lesson: { id: lessonId, ...lessonData } as Lesson,
      teacherData: teacherData as TeacherData
    };
  },

  async createBooking(lessonId: string, timeSlot: string, userId: string, userData: any): Promise<void> {
    // Implement booking logic using Supabase
    // This will require additional logic based on your booking structure
  }
}; 