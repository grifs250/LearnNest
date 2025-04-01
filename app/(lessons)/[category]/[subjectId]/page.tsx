import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getSubjectById } from '@/features/lessons/services/subjectService';
import { notFound } from 'next/navigation';
import SubjectDetail from './client';

// Proper type for params
interface PageProps {
  params: {
    category: string;
    subjectId: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  try {
    // Extract params immediately to avoid async issues
    const subjectId = params.subjectId;
    
    // Fetch subject for metadata
    const subject = await getSubjectById(subjectId);
    
    if (!subject) {
      return {
        title: 'Priekšmets nav atrasts | MāciesTe',
        description: 'Diemžēl meklētais priekšmets nav atrasts.',
      };
    }
    
    return {
      title: `${subject.name} | MāciesTe`,
      description: subject.description || `Apgūsti ${subject.name} ar MāciesTe platformu.`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Priekšmeta informācija | MāciesTe',
      description: 'Uzzini vairāk par šo priekšmetu mūsu platformā.',
    };
  }
}

export default async function SubjectPage({ params }: PageProps) {
  try {
    // Extract params immediately to avoid async issues
    const subjectId = params.subjectId;
    const category = params.category;
    
    console.log('Rendering subject page for:', { subjectId, category });
    
    // Get subject
    const subject = await getSubjectById(subjectId);
    
    if (!subject) {
      console.log('Subject not found:', subjectId);
      notFound();
    }
    
    // Create Supabase client using our server helper
    const supabase = await createServerClient();
    
    // Get lessons for this subject
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*, teacher:profiles(id, full_name, avatar_url)')
      .eq('subject_id', subjectId)
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching lessons:', error);
    }
    
    return (
      <Suspense fallback={<div>Ielādē priekšmetu...</div>}>
        <SubjectDetail subject={subject} lessons={lessons || []} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error rendering subject page:', error);
    return <div>Kļūda ielādējot priekšmetu. Lūdzu, mēģiniet vēlreiz.</div>;
  }
} 