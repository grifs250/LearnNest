/**
 * Re-exports for Supabase database clients
 * This file provides a single import point for database access
 */

import { createBrowserClient } from './client';
import { createServerClient } from './server';
import { Subject, Category, Lesson, LessonWithProfile } from '@/types/database';
import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SubjectWithCategory } from '@/types/database';

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
  }): Promise<LessonWithProfile[]> {
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
  async getLessonWithProfileById(lessonId: string): Promise<LessonWithProfile | null> {
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
}

// Export a singleton instance
export const dbService = new DbService();

// Re-export for easier imports
export { createBrowserClient, createServerClient };

// For legacy import compatibility
export default dbService; 