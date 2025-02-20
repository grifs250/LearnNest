import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nodarbības detaļas | LearnNest',
  description: 'Nodarbības informācija un rezervācija'
};

export default function LessonTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 