import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';
import type { 
  Lesson,
  BookingData,
  Teacher,
  Student,
  WorkHours,
} from '@/shared/types';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

// Lessons
export async function getLessons() {
  const { data, error } = await supabase
    .from('lessons')
    .select('*');

  if (error) throw error;
  return data as Lesson[];
}

export async function getLessonById(id: string) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Lesson;
}

export async function createLesson(lesson: Omit<Lesson, 'id'>) {
  const { data, error } = await supabase
    .from('lessons')
    .insert(lesson)
    .select()
    .single();

  if (error) throw error;
  return data as Lesson;
}

export async function updateLesson(id: string, lesson: Partial<Lesson>) {
  const { data, error } = await supabase
    .from('lessons')
    .update(lesson)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Lesson;
}

export async function deleteLesson(id: string) {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Bookings
export async function getBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .or(`student_id.eq.${userId},teacher_id.eq.${userId}`);

  if (error) throw error;
  return data as BookingData[];
}

export async function createBooking(booking: Omit<BookingData, 'id'>) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data as BookingData;
}

export async function updateBooking(id: string, booking: Partial<BookingData>) {
  const { data, error } = await supabase
    .from('bookings')
    .update(booking)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as BookingData;
}

// Teachers
export async function getTeachers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'teacher');

  if (error) throw error;
  return data as Teacher[];
}

export async function getTeacherById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'teacher')
    .single();

  if (error) throw error;
  return data as Teacher;
}

// Students
export async function getStudents() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student');

  if (error) throw error;
  return data as Student[];
}

export async function getStudentById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'student')
    .single();

  if (error) throw error;
  return data as Student;
}

// Work Hours
export async function getTeacherWorkHours(teacherId: string) {
  const { data, error } = await supabase
    .from('work_hours')
    .select('*')
    .eq('teacher_id', teacherId);

  if (error) throw error;
  return data as WorkHours[];
}

export async function updateWorkHours(teacherId: string, workHours: WorkHours[]) {
  const { error } = await supabase
    .from('work_hours')
    .upsert(
      workHours.map(hours => ({
        ...hours,
        teacher_id: teacherId,
      }))
    );

  if (error) throw error;
}

// Categories and Subjects
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*');

  if (error) throw error;
  return data;
}

export async function getSubjects(categoryId?: string) {
  let query = supabase.from('subjects').select('*');
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
} 