'use client';

import { LessonErrorBoundary } from '@/features/lessons/components';

export default function SubjectError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <LessonErrorBoundary error={error} reset={reset} />;
} 