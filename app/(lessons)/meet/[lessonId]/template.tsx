import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tiešsaistes nodarbība | MāciesTe',
  description: 'Piedalies tiešsaistes nodarbībā'
};

export default function MeetTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 