/**
 * Re-exports for Supabase database clients
 * This file provides a single import point for database access
 */

import { createBrowserClient } from './client';
import { createServerClient } from './server';
import { Subject, Category, Lesson, CategoryWithSubjects, BookingWithDetails, BookingStatus, Vacancy, SubjectWithCategory } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

/**
 * Database service for handling data operations
 * @remarks This service is designed to work with both client and server components
 */
class DbService {
  private supabase;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  /**
   * Get client instance for components
   */
  getClient() {
    return createClientComponentClient();
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Get a category with its subjects
   * @param categoryId - The category ID
   */
  async getCategoryWithSubjects(categoryId: string): Promise<CategoryWithSubjects | null> {
    try {
      // First get the category
      const { data: category, error: categoryError } = await this.supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();
      
      if (categoryError) throw categoryError;
      if (!category) return null;

      // Then get subjects for this category
      const { data: subjects, error: subjectsError } = await this.supabase
        .from('subjects')
        .select('*')
        .eq('category_id', categoryId)
        .order('name');
      
      if (subjectsError) throw subjectsError;

      // Return category with subjects
      return {
        ...category,
        subjects: subjects || []
      };
    } catch (error) {
      console.error('Error fetching category with subjects:', error);
      return null;
    }
  }

  /**
   * Get all subjects with their categories
   */
  async getSubjectsWithCategories(): Promise<SubjectWithCategory[]> {
    try {
      const { data, error } = await this.supabase
        .from('subjects')
        .select(`
          *,
          category:categories(*)
        `)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subjects with categories:', error);
      return [];
    }
  }

  /**
   * Get subjects by category
   * @param categoryId - The category ID to filter by
   */
  async getSubjectsByCategory(categoryId: string): Promise<Subject[]> {
    try {
      const { data, error } = await this.supabase
        .from('subjects')
        .select('*')
        .eq('category_id', categoryId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subjects by category:', error);
      return [];
    }
  }

  /**
   * Get lessons with optional filters
   * @param options - Filter options
   */
  async getLessons(options?: {
    subject_id?: string;
    teacher_id?: string;
    is_active?: boolean;
  }): Promise<Lesson[]> {
    try {
      let query = this.supabase
        .from('lessons')
        .select('*');

      if (options?.subject_id) {
        query = query.eq('subject_id', options.subject_id);
      }

      if (options?.teacher_id) {
        query = query.eq('teacher_id', options.teacher_id);
      }

      if (options?.is_active !== undefined) {
        query = query.eq('is_active', options.is_active);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }
  }

  /**
   * Get lessons with teacher profiles
   * @param options - Filter options
   */
  async getLessonsWithProfiles(options?: {
    subject_id?: string;
    teacher_id?: string;
    is_active?: boolean;
  }): Promise<Lesson[]> {
    try {
      let query = this.supabase
        .from('lessons')
        .select(`
          *,
          teacher:profiles(*)
        `);

      if (options?.subject_id) {
        query = query.eq('subject_id', options.subject_id);
      }

      if (options?.teacher_id) {
        query = query.eq('teacher_id', options.teacher_id);
      }

      if (options?.is_active !== undefined) {
        query = query.eq('is_active', options.is_active);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching lessons with profiles:', error);
      return [];
    }
  }

  /**
   * Get a specific lesson by ID
   * @param lessonId - The lesson ID
   */
  async getLessonById(lessonId: string): Promise<Lesson | null> {
    try {
      const { data, error } = await this.supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching lesson by ID:', error);
      return null;
    }
  }

  /**
   * Get a lesson with teacher profile by lesson ID
   * @param lessonId - The lesson ID
   */
  async getLessonWithProfileById(lessonId: string): Promise<Lesson | null> {
    try {
      const { data, error } = await this.supabase
        .from('lessons')
        .select(`
          *,
          teacher:profiles(*)
        `)
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching lesson with profile by ID:', error);
      return null;
    }
  }

  /**
   * Get bookings with optional filters
   * @param options - Filter options
   */
  async getBookings(options?: {
    student_id?: string;
    teacher_id?: string;
    status?: BookingStatus;
    start_date?: string;
    end_date?: string;
  }): Promise<BookingWithDetails[]> {
    try {
      let query = this.supabase
        .from('bookings')
        .select(`
          *,
          schedule:lesson_schedules(*),
          lesson:lessons(
            id,
            title,
            description,
            price,
            duration,
            teacher:profiles(
              id,
              full_name,
              email,
              avatar_url
            )
          )
        `);

      if (options?.student_id) {
        query = query.eq('student_id', options.student_id);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.start_date) {
        query = query.gte('created_at', options.start_date);
      }

      if (options?.end_date) {
        query = query.lte('created_at', options.end_date);
      }

      // If teacher_id is provided, we need to filter by lessons with that teacher
      if (options?.teacher_id) {
        query = query.eq('lesson.teacher_id', options.teacher_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process data to match BookingWithDetails structure
      return (data || []).map((booking: any) => ({
        id: booking.id,
        student_id: booking.student_id,
        schedule_id: booking.schedule_id,
        status: booking.status,
        payment_status: booking.payment_status,
        amount: booking.amount,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        schedule: booking.schedule || {},
        lesson: booking.lesson || {
          id: '',
          title: 'Unknown Lesson',
          description: null,
          price: 0,
          teacher: {
            id: '',
            full_name: 'Unknown Teacher',
            email: '',
            avatar_url: null
          }
        }
      }));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  /**
   * Get available vacancies (lesson slots)
   */
  async getVacancies(): Promise<Vacancy[]> {
    try {
      const { data, error } = await this.supabase
        .from('lesson_schedules')
        .select(`
          *,
          lesson:lessons (
            id,
            title,
            description,
            price,
            duration
          )
        `)
        .eq('is_available', true);

      if (error) throw error;

      return data.map(schedule => ({
        id: schedule.id,
        lesson_id: schedule.lesson_id, // Include lesson_id to match Vacancy interface
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        is_available: schedule.is_available ?? true,
        lesson: {
          id: schedule.lesson.id,
          title: schedule.lesson.title,
          description: schedule.lesson.description,
          price: schedule.lesson.price,
          duration: schedule.lesson.duration
        },
        created_at: schedule.created_at,
        updated_at: schedule.updated_at
      }));
    } catch (error) {
      console.error('Error fetching vacancies:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const dbService = new DbService();

// Re-export for easier imports
export { createBrowserClient, createServerClient };

// For legacy import compatibility
export default dbService; 