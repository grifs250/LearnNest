import { Suspense } from 'react';
import { getSubjectById } from '@/features/lessons/services/subjectService';
import { notFound, redirect } from 'next/navigation';
import SubjectDetail from './client';
import { createServerClient } from '@/lib/supabase/server';

// Proper type for params
interface PageProps {
  params: {
    category: string;
    subjectId: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  try {
    // Directly use params.subjectId as it's correctly passed in async function
    const subjectId = params.subjectId;

    // Basic check to avoid DB query if it's clearly not a UUID
    if (subjectId.startsWith('user_')) {
       console.warn(`generateMetadata: Received user ID "${subjectId}" instead of subject UUID.`);
       return {
         title: 'Tiek novirzīts... | MāciesTe',
         description: 'Tiek novirzīts uz pareizo profila lapu.',
       };
    }

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
  } catch (error: any) {
    // Log specific DB error if available
    if (error && error.code === '22P02') {
       console.error(`generateMetadata: Invalid UUID format for subjectId: "${params.subjectId}"`);
    } else {
       console.error('Error generating metadata:', error);
    }
    return {
      title: 'Priekšmeta informācija | MāciesTe',
      description: 'Neizdevās ielādēt priekšmeta informāciju.',
    };
  }
}

export default async function SubjectPage({ params }: PageProps) {
  // Directly use params as it's correctly passed in async function
  const subjectId = params.subjectId;
  const category = params.category;

  console.log('⏳ Rendering subject page for:', { subjectId, category });

  // **Crucial Check:** If the subjectId looks like a user ID, redirect to the correct path
  if (subjectId.startsWith('user_')) {
    console.log('🔄 Detected user ID in subject route:', subjectId);
    console.log(`🔄 Redirecting from /${category}/${subjectId} to /profiles/${subjectId}`);
    
    // Redirect to profiles (plural) route
    redirect(`/profiles/${subjectId}`);
  }

  try {
    // Create Supabase client using our server helper - THIS needs await
    const supabase = await createServerClient(); 

    // Get subject - This query will now only run if subjectId is not 'user_...'
    const subject = await getSubjectById(subjectId);

    if (!subject) {
      console.log('Subject not found:', subjectId);
      notFound(); // Trigger Next.js 404 page
    }

    // Get lessons for this subject
    // Use await on the Supabase call, not on createServerClient itself
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*, teacher:profiles(id, full_name, avatar_url)')
      .eq('subject_id', subjectId)
      .eq('is_active', true);

    if (lessonsError) {
      // Log the specific error from Supabase
      console.error('Error fetching lessons:', lessonsError);
      // Potentially show a less critical error message, maybe lessons failed but page can still load
    }

    return (
      <Suspense fallback={<div>Ielādē priekšmetu...</div>}>
        <SubjectDetail subject={subject} lessons={lessons || []} />
      </Suspense>
    );
  } catch (error: any) {
     // Catch potential errors during DB interaction or rendering
     if (error && error.code === '22P02') {
        console.error(`SubjectPage: Invalid UUID format for subjectId: "${subjectId}"`);
        return <div>Kļūda: Nepareizs priekšmeta ID formāts.</div>;
     } else {
        console.error('Error rendering subject page:', error);
        // General error fallback
        return <div>Kļūda ielādējot priekšmetu. Lūdzu, mēģiniet vēlreiz.</div>;
     }
  }
} 