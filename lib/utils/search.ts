import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type SearchableTable = 'profiles' | 'lessons' | 'subjects';

export interface SearchResult {
  id: string;
  title: string;
  description?: string | null;
  type: 'teacher' | 'lesson' | 'subject';
  url: string;
  imageUrl?: string | null;
}

/**
 * Search across teachers, lessons, and subjects
 */
export async function searchAll(query: string): Promise<SearchResult[]> {
  const supabase = createClient();
  
  // Run all searches concurrently
  const [teachers, lessons, subjects] = await Promise.all([
    searchTeachers(query, supabase),
    searchLessons(query, supabase),
    searchSubjects(query, supabase)
  ]);
  
  // Combine and sort results
  return [
    ...teachers,
    ...lessons, 
    ...subjects
  ].sort((a, b) => {
    // Sort by relevance (simple implementation - could be improved)
    if (a.title.toLowerCase().includes(query.toLowerCase())) return -1;
    if (b.title.toLowerCase().includes(query.toLowerCase())) return 1;
    return 0;
  });
}

async function searchTeachers(query: string, supabase = createClient()) {
  const { data } = await supabase
    .from('profiles')
    .select(`
      id, 
      full_name, 
      bio, 
      avatar_url,
      role
    `)
    .eq('role', 'teacher')
    .ilike('full_name', `%${query}%`)
    .limit(10);
  
  return (data || []).map(profile => ({
    id: profile.id,
    title: profile.full_name,
    description: profile.bio,
    type: 'teacher' as const,
    url: `/teachers/${profile.id}`,
    imageUrl: profile.avatar_url
  }));
}

async function searchLessons(query: string, supabase = createClient()) {
  const { data } = await supabase
    .from('lessons')
    .select(`
      id, 
      title, 
      description,
      teacher_id,
      subject_id
    `)
    .ilike('title', `%${query}%`)
    .limit(10);
    
  // For simplicity, we'll just return basic lesson info
  return (data || []).map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    type: 'lesson' as const,
    url: `/lessons/${lesson.id}`,
    imageUrl: null
  }));
}

async function searchSubjects(query: string, supabase = createClient()) {
  const { data } = await supabase
    .from('subjects')
    .select(`
      id, 
      name, 
      description,
      slug
    `)
    .ilike('name', `%${query}%`)
    .limit(10);
  
  return (data || []).map(subject => ({
    id: subject.id,
    title: subject.name,
    description: subject.description,
    type: 'subject' as const,
    url: `/subjects/${subject.slug || subject.id}`,
    imageUrl: null
  }));
} 