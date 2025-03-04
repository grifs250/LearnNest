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

export default function LessonPage({ params }: LessonPageProps) {
  // Server-only data fetching if needed
  // const data = await fetchDataOnServer(params);
  
  return <ClientComponents.LessonDetail params={params} />;
}