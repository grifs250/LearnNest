import type { Database } from '@/types/supabase.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface ExtendedProfile extends Profile {
  student_profile?: Database['public']['Tables']['student_profiles']['Row'];
  teacher_profile?: Database['public']['Tables']['teacher_profiles']['Row'];
} 