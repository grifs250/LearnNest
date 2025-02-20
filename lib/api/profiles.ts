"use server";
import { supabase } from '@/lib/supabase/client';
import { Profile, TeacherProfile, StudentProfile, UserRole } from '@/types/supabase';

// Get base profile by ID
export const getProfileById = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
};

// Get teacher profile by ID
export const getTeacherProfileById = async (userId: string) => {
  const { data, error } = await supabase
    .from('teacher_profiles')
    .select(`
      *,
      profile:id(*)
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as TeacherProfile;
};

// Get student profile by ID
export const getStudentProfileById = async (userId: string) => {
  const { data, error } = await supabase
    .from('student_profiles')
    .select(`
      *,
      profile:id(*)
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as StudentProfile;
};

// Create or update base profile
export const upsertProfile = async (
  userId: string,
  profile: {
    email: string;
    full_name: string;
    role?: UserRole;
    avatar_url?: string;
    bio?: string;
    phone?: string;
    timezone?: string;
    language?: string;
    is_active?: boolean;
    metadata?: Record<string, any>;
  }
) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...profile,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
};

// Create or update teacher profile
export const upsertTeacherProfile = async (
  userId: string,
  profile: {
    education?: string[];
    experience?: string[];
    certificates?: string[];
    specializations?: string[];
    hourly_rate: number;
    availability?: Record<string, any>;
  }
) => {
  const { data, error } = await supabase
    .from('teacher_profiles')
    .upsert({
      id: userId,
      ...profile,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data as TeacherProfile;
};

// Create or update student profile
export const upsertStudentProfile = async (
  userId: string,
  profile: {
    learning_goals?: string[];
    interests?: string[];
    preferred_languages?: string[];
    study_schedule?: Record<string, any>;
  }
) => {
  const { data, error } = await supabase
    .from('student_profiles')
    .upsert({
      id: userId,
      ...profile,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data as StudentProfile;
};

// Get all teachers
export const getAllTeachers = async () => {
  const { data, error } = await supabase
    .from('teacher_profiles')
    .select(`
      *,
      profile:id(*),
      subjects:teacher_subjects(
        *,
        subject:subject_id(*)
      )
    `)
    .order('rating', { ascending: false });

  if (error) throw error;
  return data as TeacherProfile[];
};

// Search teachers
export const searchTeachers = async (query: string) => {
  const { data, error } = await supabase
    .from('teacher_profiles')
    .select(`
      *,
      profile:id!inner(*),
      subjects:teacher_subjects(
        *,
        subject:subject_id(*)
      )
    `)
    .textSearch('profile.full_name', query, {
      type: 'websearch',
      config: 'english'
    })
    .order('rating', { ascending: false });

  if (error) throw error;
  return data as TeacherProfile[];
};

// Get top rated teachers
export const getTopTeachers = async (limit = 10) => {
  const { data, error } = await supabase
    .from('teacher_profiles')
    .select(`
      *,
      profile:id(*),
      subjects:teacher_subjects(
        *,
        subject:subject_id(*)
      )
    `)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as TeacherProfile[];
};

// Update teacher rating
export const updateTeacherRating = async (teacherId: string) => {
  // Calculate new rating from reviews
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('teacher_id', teacherId);

  if (reviewsError) throw reviewsError;

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    : 0;

  // Update teacher profile with new rating
  const { error: updateError } = await supabase
    .from('teacher_profiles')
    .update({
      rating: averageRating,
      total_reviews: totalReviews,
      updated_at: new Date().toISOString()
    })
    .eq('id', teacherId);

  if (updateError) throw updateError;
}; 