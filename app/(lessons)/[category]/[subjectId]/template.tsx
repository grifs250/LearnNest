import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nodarbības | LearnNest',
  description: 'Pārlūko pieejamās nodarbības'
};

export default function SubjectTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 