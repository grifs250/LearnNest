"use client";

import { Metadata } from 'next';
import { useParams } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Nodarbības | LearnNest',
  description: 'Pārlūko pieejamās nodarbības'
};

export default function SubjectTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const subject_id = params.subjectId;
  return children;
} 