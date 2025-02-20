import type { BaseUserFields, WorkHours } from './base';

export interface Teacher extends BaseUserFields {
  role: 'teacher';
  description?: string;
  education?: string;
  experience?: string;
  workHours: WorkHours;
  subjects: string[];
  rating?: number;
  totalReviews?: number;
}

export interface Student extends BaseUserFields {
  role: 'student';
  preferences?: {
    subjects?: string[];
    teacherIds?: string[];
    maxPrice?: number;
    preferredTimes?: string[];
  };
}

export interface Admin extends BaseUserFields {
  role: 'admin';
  permissions: string[];
}

export type User = Teacher | Student | Admin;

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  role?: 'student' | 'teacher' | 'admin';
  emailVerified: boolean;
} 