import { createBrowserClient } from '@supabase/ssr';
import { supabaseConfig } from './config';
import type { 
  Lesson 
} from '@/features/lessons/types';
import type { 
  Booking,
  Vacancy 
} from '@/features/bookings/types';
import type {
  WorkHours,
  TimeRange
} from '@/features/schedule/types';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
export async function getBookings(teacherId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('teacher_id', teacherId);

  if (error) throw error;
  return data;
}

export async function createBooking(booking: Omit<Booking, 'id'>) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
}

export async function updateBooking(id: string, booking: Partial<Booking>) {
  const { data, error } = await supabase
    .from('bookings')
    .update(booking)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
}

// Teachers
export async function getTeachers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'teacher');

  if (error) throw error;
  return data; // Adjusted to return data directly
}

export async function getTeacherById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'teacher')
    .single();

  if (error) throw error;
  return data; // Adjusted to return data directly
}

// Students
export async function getStudents() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student');

  if (error) throw error;
  return data; // Adjusted to return data directly
}

export async function getStudentById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'student')
    .single();

  if (error) throw error;
  return data; // Adjusted to return data directly
}

// Work Hours
export async function getTeacherWorkHours(teacherId: string) {
  const { data, error } = await supabase
    .from('work_hours')
    .select('*')
    .eq('teacher_id', teacherId);

  if (error) throw error;
  return data; // Adjusted to return data directly
}

export async function updateWorkHours(teacherId: string, workHours: Array<{ enabled: boolean; timeSlots: TimeRange[] }>) {
  const { error } = await supabase
    .from('work_hours')
    .upsert(
      workHours.map((schedule, index) => ({
        teacher_id: teacherId,
        day_of_week: index,
        enabled: schedule.enabled,
        time_slots: schedule.timeSlots
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
  return data; // Adjusted to return data directly
}

export async function getSubjects(categoryId?: string) {
  let query = supabase.from('subjects').select('*');
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data; // Adjusted to return data directly
}

export async function getVacancies() {
  const { data, error } = await supabase
    .from('vacancies')
    .select('*');

  if (error) throw error;
  return data; // Adjusted to return data directly
}

export async function updateVacancy(vacancyId: string, updates: Partial<Vacancy>) {
  const { data, error } = await supabase
    .from('vacancies')
    .update(updates)
    .eq('id', vacancyId);

  if (error) throw error;
  return data; // Adjusted to return data directly
}