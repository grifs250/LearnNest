import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nodarbības | MāciesTe',
  description: 'Pārlūko un piesakies uz nodarbībām'
};

export default function LessonsTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

// Check for any dynamic route references