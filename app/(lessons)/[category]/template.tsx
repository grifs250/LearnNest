import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Priekšmeti | LearnNest',
  description: 'Pārlūko pieejamos priekšmetus'
};

export default function CategoryTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 