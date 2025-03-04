import { Profile, UserRole } from '@/lib/types/database.types';

export type {
  Profile,
  UserRole
};

export type UserSession = {
  userId: string;
  profileId: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export type AuthFormData = {
  email: string;
  password: string;
};

export type RegisterFormData = AuthFormData & {
  fullName: string;
  role: UserRole;
};

export type ProfileUpdateData = {
  full_name?: string;
  bio?: string;
  phone?: string;
  age?: number;
  languages?: string[];
  hourly_rate?: number;
  learning_goals?: string[];
}; 