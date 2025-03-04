import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Client-side Supabase client
export const createClient = () => {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Helper to format Clerk IDs for Supabase
export const formatClerkId = (clerkId: string): string => {
  // Ensure the ID is properly formatted for Supabase
  // This might involve removing prefixes or ensuring consistent format
  return clerkId;
};

// Re-export server-related functions if needed
export * from './server'; 