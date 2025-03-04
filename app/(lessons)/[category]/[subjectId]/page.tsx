import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { SubjectClient } from './client';
import { Subject, Lesson, LessonWithProfile } from '@/types/database';
import { dbService } from '@/lib/supabase/db';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';

// Interface for Next.js App Router page component
interface SubjectPageProps {
  params: {
    category: string;
    subjectId: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

// In Next.js App Router, page components can be async
export default async function SubjectPage({ params, searchParams }: SubjectPageProps) {
  // Fetch subject data
  const subject = await fetchSubject(params.subjectId);
  
  if (!subject) {
    return notFound();
  }
  
  // Fetch related lessons
  const lessons = await fetchLessons(subject.id);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{subject.name}</h1>
      
      <Suspense fallback={<LoadingSpinner />}>
        <SubjectClient subject={subject} lessons={lessons} />
      </Suspense>
    </div>
  );
}

async function fetchSubject(subjectId: string): Promise<Subject | null> {
  try {
    const subject = await dbService.getSubject(subjectId);
    return subject;
  } catch (error) {
    console.error('Error fetching subject:', error);
    return null;
  }
}

async function fetchLessons(subjectId: string): Promise<LessonWithProfile[]> {
  try {
    const lessons = await dbService.getLessonsWithProfiles({ subject_id: subjectId, is_active: true });
    return lessons;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
} 