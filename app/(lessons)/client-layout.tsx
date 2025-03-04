'use client';

import { LessonsProvider } from "@/features/lessons/context/LessonsContext";

export function LessonsProviderWrapper({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <LessonsProvider>
      {children}
    </LessonsProvider>
  );
} 