"use server";
import { supabase } from '@/lib/supabase/client';
import { Lesson, LessonSchedule } from '@/lib/types';

// Get all lessons
export const getAllLessons = async () => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      teacher:teacher_id(
        *,
        profile:id(*)
      ),
      subject:subject_id(*),
      schedules:lesson_schedules(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Lesson[];
};

// Get lesson by ID
export const getLessonById = async (lessonId: string) => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      teacher:teacher_id(
        *,
        profile:id(*)
      ),
      subject:subject_id(*),
      schedules:lesson_schedules(*)
    `)
    .eq('id', lessonId)
    .single();

  if (error) throw error;
  return data as Lesson;
};

// Get lessons by teacher
export const getTeacherLessons = async (teacherId: string) => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      subject:subject_id(*),
      schedules:lesson_schedules(*)
    `)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Lesson[];
};

// Get lessons by subject
export const getLessonsBySubject = async (subjectId: string) => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      teacher:teacher_id(
        *,
        profile:id(*)
      ),
      schedules:lesson_schedules(*)
    `)
    .eq('subject_id', subjectId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Lesson[];
};

// Create lesson
export const createLesson = async (
  lesson: {
    teacher_id: string;
    subject_id: string;
    title: string;
    description?: string;
    duration: number;
    max_students?: number;
    price: number;
    is_active?: boolean;
    metadata?: Record<string, any>;
  }
) => {
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      ...lesson,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data as Lesson;
};

// Update lesson
export const updateLesson = async (
  lessonId: string,
  updates: {
    title?: string;
    description?: string;
    duration?: number;
    max_students?: number;
    price?: number;
    is_active?: boolean;
    metadata?: Record<string, any>;
  }
) => {
  const { data, error } = await supabase
    .from('lessons')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', lessonId)
    .select()
    .single();

  if (error) throw error;
  return data as Lesson;
};

// Delete lesson
export const deleteLesson = async (lessonId: string) => {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) throw error;
};

// Get lesson schedules
export const getLessonSchedules = async (lessonId: string) => {
  const { data, error } = await supabase
    .from('lesson_schedules')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data as LessonSchedule[];
};

// Get available lesson schedules
export const getAvailableLessonSchedules = async (lessonId: string) => {
  const { data, error } = await supabase
    .from('lesson_schedules')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('is_available', true)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data as LessonSchedule[];
};

// Create lesson schedule
export const createLessonSchedule = async (
  schedule: {
    lesson_id: string;
    start_time: string;
    end_time: string;
    is_available?: boolean;
  }
) => {
  const { data, error } = await supabase
    .from('lesson_schedules')
    .insert({
      ...schedule,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data as LessonSchedule;
};

// Update lesson schedule
export const updateLessonSchedule = async (
  scheduleId: string,
  updates: {
    start_time?: string;
    end_time?: string;
    is_available?: boolean;
  }
) => {
  const { data, error } = await supabase
    .from('lesson_schedules')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', scheduleId)
    .select()
    .single();

  if (error) throw error;
  return data as LessonSchedule;
};

// Delete lesson schedule
export const deleteLessonSchedule = async (scheduleId: string) => {
  const { error } = await supabase
    .from('lesson_schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) throw error;
};

// Batch create lesson schedules
export const createLessonSchedules = async (
  schedules: {
    lesson_id: string;
    start_time: string;
    end_time: string;
    is_available?: boolean;
  }[]
) => {
  const { data, error } = await supabase
    .from('lesson_schedules')
    .insert(
      schedules.map(schedule => ({
        ...schedule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
    )
    .select();

  if (error) throw error;
  return data as LessonSchedule[];
}; 