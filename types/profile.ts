import type { UserRole } from '@/lib/types/database.types';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  bio?: string | null;
  phone?: string | null;
  timezone?: string;
  language?: string;
  is_active: boolean;
  metadata?: Record<string, any> | null;
  settings?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
  hourly_rate?: number | null;
  learning_goals?: string[] | null;
  age?: number | null;
  languages?: string[] | null;
  education_documents?: string[] | null;
  tax_id?: string | null;
  personal_id?: string | null;
  verification_status?: string | null;
  stripe_customer_id?: string | null;
  stripe_account_id?: string | null;
} 