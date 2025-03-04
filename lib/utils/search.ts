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
 * Search across multiple tables using the text search indexes
 */
export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const supabase = createClient();
  const formattedQuery = query.trim();
  
  // Execute searches in parallel
  const [teacherResults, lessonResults, subjectResults] = await Promise.all([
    searchTeachers(formattedQuery, supabase),
    searchLessons(formattedQuery, supabase),
    searchSubjects(formattedQuery, supabase)
  ]);
  
  // Combine and sort results by relevance
  return [
    ...teacherResults,
    ...lessonResults, 
    ...subjectResults
  ];
}

async function searchTeachers(query: string, supabase = createClient()) {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, bio, avatar_url')
    .eq('role', 'teacher')
    .textSearch(
      'full_name,bio', 
      query, 
      { config: 'simple' }
    )
    .limit(5);
    
  return (data || []).map(teacher => ({
    id: teacher.id,
    title: teacher.full_name,
    description: teacher.bio,
    type: 'teacher' as const,
    url: `/teachers/${teacher.id}`,
    imageUrl: teacher.avatar_url
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
      profiles:teacher_id (full_name, avatar_url),
      subjects:subject_id (name)
    `)
    .textSearch(
      'title,description', 
      query, 
      { config: 'simple' }
    )
    .eq('is_active', true)
    .limit(10);
    
  return (data || []).map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    type: 'lesson' as const,
    url: `/lessons/${lesson.id}`,
    imageUrl: null,
    teacherName: lesson.profiles?.full_name,
    subjectName: lesson.subjects?.name
  }));
}

async function searchSubjects(query: string, supabase = createClient()) {
  const { data } = await supabase
    .from('subjects')
    .select(`
      id, 
      name, 
      description,
      slug,
      categories:category_id (name, slug)
    `)
    .textSearch(
      'name,description', 
      query, 
      { config: 'simple' }
    )
    .eq('is_active', true)
    .limit(5);
    
  return (data || []).map(subject => ({
    id: subject.id,
    title: subject.name,
    description: subject.description,
    type: 'subject' as const,
    url: `/${subject.categories?.slug || 'subjects'}/${subject.slug}`,
    imageUrl: null,
    categoryName: subject.categories?.name
  }));
} 