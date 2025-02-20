import { Metadata } from '@/features/shared/types';

// User roles and auth modes
export type UserRole = 'student' | 'teacher' | 'admin';
export type AuthMode = 'signIn' | 'signUp';
export type AuthProvider = 'email' | 'google' | 'github';

// Core user interfaces
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
  metadata?: Record<string, any>;
}

export interface UserProfile extends Metadata {
  id: string;
  userId: string;
  fullName: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

// Auth state
export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Auth form props
export interface AuthFormProps {
  mode: AuthMode;
  onSuccess?: () => void;
}

// Credentials interfaces
export interface SignInCredentials {
  email: string;
  password: string;
  provider?: AuthProvider;
}

export interface SignUpCredentials extends SignInCredentials {
  fullName: string;
  role: UserRole;
}

export interface ResetPasswordCredentials {
  email: string;
}

export interface UpdatePasswordCredentials {
  currentPassword: string;
  newPassword: string;
}

// Error and session interfaces
export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

// Re-export all types from auth.ts
export * from './auth'; 