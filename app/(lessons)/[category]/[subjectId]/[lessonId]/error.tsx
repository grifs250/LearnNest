'use client';

import { LessonErrorBoundary } from '@/features/lessons/components';

export default function LessonError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <LessonErrorBoundary error={error} reset={reset} />;
} 