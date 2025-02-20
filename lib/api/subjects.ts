"use server";
import { supabase } from '@/lib/supabase/client';
import { Subject, TeacherSubject } from '@/types/supabase';

// Get all subjects
export const getAllSubjects = async () => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*, parent:parent_id(*)')
    .order('name');
  
  if (error) throw error;
  return data as Subject[];
};

// Get subject by ID
export const getSubjectById = async (id: string) => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*, parent:parent_id(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Subject;
};

// Get child subjects
export const getChildSubjects = async (parentId: string) => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*, parent:parent_id(*)')
    .eq('parent_id', parentId)
    .order('name');
  
  if (error) throw error;
  return data as Subject[];
};

// Get root subjects (no parent)
export const getRootSubjects = async () => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .is('parent_id', null)
    .order('name');
  
  if (error) throw error;
  return data as Subject[];
};

// Get teacher's subjects
export const getTeacherSubjects = async (teacherId: string) => {
  const { data, error } = await supabase
    .from('teacher_subjects')
    .select(`
      *,
      subject:subject_id(*)
    `)
    .eq('teacher_id', teacherId);
  
  if (error) throw error;
  return data as TeacherSubject[];
};

// Add subject to teacher with experience and rate
export const addTeacherSubject = async (
  teacherId: string, 
  subjectId: string,
  experienceYears?: number,
  hourlyRate?: number
) => {
  const { data, error } = await supabase
    .from('teacher_subjects')
    .insert({
      teacher_id: teacherId,
      subject_id: subjectId,
      experience_years: experienceYears,
      hourly_rate: hourlyRate
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as TeacherSubject;
};

// Update teacher subject details
export const updateTeacherSubject = async (
  teacherId: string,
  subjectId: string,
  updates: {
    experienceYears?: number;
    hourlyRate?: number;
    isVerified?: boolean;
  }
) => {
  const { data, error } = await supabase
    .from('teacher_subjects')
    .update({
      experience_years: updates.experienceYears,
      hourly_rate: updates.hourlyRate,
      is_verified: updates.isVerified
    })
    .match({
      teacher_id: teacherId,
      subject_id: subjectId
    })
    .select()
    .single();

  if (error) throw error;
  return data as TeacherSubject;
};

// Remove subject from teacher
export const removeTeacherSubject = async (teacherId: string, subjectId: string) => {
  const { error } = await supabase
    .from('teacher_subjects')
    .delete()
    .match({
      teacher_id: teacherId,
      subject_id: subjectId
    });
  
  if (error) throw error;
};

// Get teachers by subject
export const getTeachersBySubject = async (subjectId: string) => {
  const { data, error } = await supabase
    .from('teacher_subjects')
    .select(`
      teacher:teacher_id(
        *,
        profile:id(*)
      )
    `)
    .eq('subject_id', subjectId);
  
  if (error) throw error;
  return data.map(item => item.teacher);
}; 