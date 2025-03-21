import { createClient } from '@supabase/supabase-js';
import { getSubjectById } from '@/features/lessons/services/subjectService';
import { notFound } from 'next/navigation';
import SubjectDetail from './client';

// Create a direct client to avoid dependency issues during fetching
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

export async function generateMetadata({ params }: { params: { subjectId: string } }) {
  const subject = await getSubjectById(params.subjectId);
  
  if (!subject) {
    return {
      title: 'Priekšmets nav atrasts | MāciesTe',
      description: 'Meklētais mācību priekšmets nav atrasts.',
    };
  }
  
  return {
    title: `${subject.name} | MāciesTe`,
    description: subject.description || `Mācies ${subject.name} tiešsaistē ar kvalificētiem pasniedzējiem.`,
  };
}

export default async function SubjectPage({ params }: { params: { subjectId: string, category: string } }) {
  console.log('Fetching subject page data for:', params.subjectId);
  
  // Fetch the subject
  const subject = await getSubjectById(params.subjectId);
  
  if (!subject) {
    console.error('Subject not found:', params.subjectId);
    notFound();
  }
  
  // Get lessons for this subject
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select(`
      *,
      teacher:profiles(id, full_name, avatar_url)
    `)
    .eq('subject_id', params.subjectId)
    .eq('is_active', true);
    
  if (error) {
    console.error('Error fetching lessons:', error);
  }
  
  // Return the client component with all data
  return (
    <SubjectDetail 
      subject={subject} 
      lessons={lessons || []} 
    />
  );
} 