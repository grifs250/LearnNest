import { 
  UserProfile, 
  StudentProfile, 
  TeacherProfile, 
} from '@/types/database';
import type { Database } from '@/lib/types/supabase';

// Re-export base types
export type { 
  UserProfile, 
  StudentProfile, 
  TeacherProfile
};

// Database row types - using compatibility types
export type DbProfile = UserProfile; 
export type DbTeacherProfile = UserProfile & { profile_type: 'teacher' };
export type DbStudentProfile = UserProfile & { profile_type: 'student' };

// Profile feature-specific types
export interface ProfileFormData {
  full_name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  languages?: string[];
  learning_goals?: string[];
  hourly_rate?: number;
  education?: string[];
  experience?: string;
  verification_docs?: File[];
}

export interface TeacherProfileFormData extends ProfileFormData {
  hourly_rate: number;
  education: string[];
  experience: string;
  expertise_areas?: string[];
  available_hours?: AvailableHours;
  tax_id?: string;
  bank_account?: BankAccount;
}

export interface StudentProfileFormData extends ProfileFormData {
  learning_goals: string[];
  interests?: string[];
  age?: number;
}

export interface AvailableHours {
  [day: string]: {
    enabled: boolean;
    slots: Array<{
      start: string;
      end: string;
    }>;
  };
}

export interface BankAccount {
  account_number: string;
  bank_code: string;
  account_holder: string;
}

export interface FilterOptions {
  subjects?: string[];
  priceRange?: [number, number];
  availability?: string[];
  rating?: number;
  languages?: string[];
}

export interface ProfileStats {
  totalLessons: number;
  totalHours: number;
  averageRating: number;
  totalStudents: number;
  totalEarnings?: number;
  lessonsCompleted?: number;
  // For students
  lessonsAttended?: number;
  favoriteSubjects?: string[];
}

export interface VerificationStatus {
  identity: 'pending' | 'verified' | 'rejected';
  education: 'pending' | 'verified' | 'rejected';
  payment: 'pending' | 'verified' | 'rejected';
  overall: 'pending' | 'verified' | 'rejected';
} 