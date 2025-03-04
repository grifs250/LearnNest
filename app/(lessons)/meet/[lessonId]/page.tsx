import { Metadata } from 'next';
import { ClientComponents } from './client';
import { generateMetadata } from './metadata';

export { generateMetadata };

interface MeetPageProps {
  params: {
    lessonId: string;
  };
}

export default function MeetPage({ params }: MeetPageProps) {
  return <ClientComponents.MeetRoom params={params} />;
} 