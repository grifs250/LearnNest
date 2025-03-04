import { supabase } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { 
  Category, 
  Subject, 
  Lesson, 
  UserProfile, 
  Booking, 
  LessonSchedule,
  LessonWithProfile,
  BookingWithDetails,
  CategoryWithSubjects 
} from '@/types/database';

/**
 * Database service for interacting with Supabase
 * Provides methods for fetching and manipulating data with proper types
 */
export const dbService = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    
    return data as Category[];
  },
  
  getCategoryWithSubjects: async (categoryId: string): Promise<CategoryWithSubjects | null> => {
    // Get the category
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .eq('is_active', true)
      .single();
    
    if (categoryError || !category) {
      console.error('Error fetching category:', categoryError);
      return null;
    }
    
    // Get the subjects for this category
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError);
      return { ...category, subjects: [] };
    }
    
    return { ...category, subjects: subjects || [] };
  },
  
  // Subjects
  getSubjects: async (categoryId?: string): Promise<Subject[]> => {
    let query = supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
    
    return data as Subject[];
  },
  
  getSubject: async (subjectId: string): Promise<Subject | null> => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Error fetching subject:', error);
      return null;
    }
    
    return data as Subject;
  },
  
  // Lessons
  getLessons: async (options?: {
    subject_id?: string;
    teacher_id?: string;
    is_active?: boolean;
    is_featured?: boolean;
  }): Promise<Lesson[]> => {
    let query = supabase.from('lessons').select('*');
    
    // Apply filters if provided
    if (options?.subject_id) {
      query = query.eq('subject_id', options.subject_id);
    }
    
    if (options?.teacher_id) {
      query = query.eq('teacher_id', options.teacher_id);
    }
    
    if (options?.is_active !== undefined) {
      query = query.eq('is_active', options.is_active);
    }
    
    if (options?.is_featured !== undefined) {
      query = query.eq('is_featured', options.is_featured);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }
    
    return data as Lesson[];
  },
  
  getLessonsWithProfiles: async (options?: {
    subject_id?: string;
    teacher_id?: string;
    is_active?: boolean;
    is_featured?: boolean;
  }): Promise<LessonWithProfile[]> => {
    let query = supabase.from('lessons_with_profiles').select('*');
    
    // Apply filters if provided
    if (options?.subject_id) {
      query = query.eq('subject_id', options.subject_id);
    }
    
    if (options?.teacher_id) {
      query = query.eq('teacher_id', options.teacher_id);
    }
    
    if (options?.is_active !== undefined) {
      query = query.eq('is_active', options.is_active);
    }
    
    if (options?.is_featured !== undefined) {
      query = query.eq('is_featured', options.is_featured);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching lessons with profiles:', error);
      return [];
    }
    
    return data as LessonWithProfile[];
  },
  
  getLesson: async (lessonId: string): Promise<Lesson | null> => {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();
    
    if (error) {
      console.error('Error fetching lesson:', error);
      return null;
    }
    
    return data as Lesson;
  },
  
  getLessonWithProfile: async (lessonId: string): Promise<LessonWithProfile | null> => {
    const { data, error } = await supabase
      .from('lessons_with_profiles')
      .select('*')
      .eq('id', lessonId)
      .single();
    
    if (error) {
      console.error('Error fetching lesson with profile:', error);
      return null;
    }
    
    return data as LessonWithProfile;
  },
  
  // User Profiles
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data as UserProfile;
  },
  
  getTeacherProfile: async (slug: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('url_slug', slug)
      .eq('profile_type', 'teacher')
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Error fetching teacher profile:', error);
      return null;
    }
    
    return data as UserProfile;
  },
  
  // Bookings
  getBookings: async (options: { 
    student_id?: string;
    status?: string;
  }): Promise<BookingWithDetails[]> => {
    let query = supabase.from('bookings_with_details').select('*');
    
    if (options.student_id) {
      query = query.eq('student_id', options.student_id);
    }
    
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
    
    return data as BookingWithDetails[];
  },
  
  createBooking: async (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking | null> => {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating booking:', error);
      return null;
    }
    
    return data as Booking;
  },
  
  // Add createLesson method
  createLesson: async (lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<Lesson | null> => {
    const { data, error } = await supabase
      .from('lessons')
      .insert(lesson)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating lesson:', error);
      return null;
    }
    
    return data as Lesson;
  },
  
  // Lesson Schedules
  getLessonSchedules: async (lessonId: string): Promise<LessonSchedule[]> => {
    const { data, error } = await supabase
      .from('lesson_schedules')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('is_available', true);
    
    if (error) {
      console.error('Error fetching lesson schedules:', error);
      return [];
    }
    
    return data as LessonSchedule[];
  }
};

// Server-side database service
export const serverDbService = {
  // This can contain server-only methods with no RLS restrictions
  // Using service role key
  
  // Example: Create a user profile when a user signs up
  createUserProfile: async (profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile | null> => {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    
    return data as UserProfile;
  }
};

// Default export for easier imports
export default dbService; 