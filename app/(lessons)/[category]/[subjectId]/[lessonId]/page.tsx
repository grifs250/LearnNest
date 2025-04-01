import { ClientComponents } from './client';
import { generateMetadata } from './metadata';

export { generateMetadata };

interface LessonPageProps {
  params: {
    category: string;
    subjectId: string;
    lessonId: string;
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  // Extract params first to avoid Next.js dynamic API warnings
  const category = params.category;
  const subjectId = params.subjectId;
  const lessonId = params.lessonId;
  
  // Server-only data fetching if needed
  // const data = await fetchDataOnServer({ category, subjectId, lessonId });
  
  return <ClientComponents.LessonDetail params={{ category, subjectId, lessonId }} />;
}