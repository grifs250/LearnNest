import { PostgrestError } from '@supabase/supabase-js';

export interface SupabaseError extends PostgrestError {
  code: string;
  message: string;
  details: string;
}

// Re-export all database types from central database types
export * from '@/types/database';

// Legacy Json definition for backward compatibility
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]; 