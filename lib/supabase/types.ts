import type { Database } from '@/types/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type Tables = Database['public']['Tables'];

// Auth
export type Profile = Tables['profiles']['Row'];
export type ProfileInsert = Tables['profiles']['Insert'];
export type ProfileUpdate = Tables['profiles']['Update'];

// Lessons
export type DbLesson = Tables['lessons']['Row'];
export type LessonInsert = Tables['lessons']['Insert'];
export type LessonUpdate = Tables['lessons']['Update'];

// Bookings
export type DbBooking = Tables['bookings']['Row'];
export type BookingInsert = Tables['bookings']['Insert'];
export type BookingUpdate = Tables['bookings']['Update'];

// Subjects
export type DbSubject = Tables['subjects']['Row'];
export type SubjectInsert = Tables['subjects']['Insert'];
export type SubjectUpdate = Tables['subjects']['Update'];

export interface User extends SupabaseUser {
  role: 'student' | 'teacher' | 'admin';
  display_name?: string;
  avatar_url?: string;
  is_active: boolean;
  metadata: {
    registration_completed: boolean;
    [key: string]: any;
  };
}

export type { SupabaseUser };

export type AuthResponse = {
  user: User | null;
  error: Error | null;
}; 