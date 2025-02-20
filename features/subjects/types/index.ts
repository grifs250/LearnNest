import type { User } from '@/features/auth/types';

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: Subject;
  children?: Subject[];
  teachers?: TeacherSubject[];
}

export interface TeacherSubject {
  id: string;
  teacher_id: string;
  subject_id: string;
  experience_years: number;
  hourly_rate: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  teacher?: User;
  subject?: Subject;
}

export interface SubjectFilters {
  parentId?: string;
  isActive?: boolean;
  search?: string;
}

export interface SubjectSummary {
  totalSubjects: number;
  activeSubjects: number;
  totalTeachers: number;
  popularSubjects: Array<{
    id: string;
    name: string;
    teacherCount: number;
  }>;
} 