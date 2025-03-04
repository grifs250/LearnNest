import { User as ClerkUser } from '@clerk/nextjs/server';
import { UserProfile, StudentProfile, TeacherProfile } from '@/types/database';

// Define UserRole type since it's being used here
export type UserRole = 'student' | 'teacher' | 'admin';

// Re-export types from database
export type { 
  UserProfile, 
  StudentProfile, 
  TeacherProfile
};

// Auth-specific types
export interface User extends ClerkUser {
  profile?: UserProfile;
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  signout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export type SignInFormData = {
  email: string;
  password: string;
};

export type SignUpFormData = {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
};

export type UIRole = 'skolēns' | 'pasniedzējs'; // For UI display

// Helper function to convert UI role to storage role
export const mapUIRoleToStorageRole = (uiRole: UIRole): UserRole => {
  return uiRole === 'pasniedzējs' ? 'teacher' : 'student';
};

// Helper function to convert storage role to UI role
export const mapStorageRoleToUIRole = (storageRole: UserRole): UIRole => {
  return storageRole === 'teacher' ? 'pasniedzējs' : 'skolēns';
};

export interface AuthUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
}