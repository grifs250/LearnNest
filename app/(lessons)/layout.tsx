'use client';

import { Suspense } from "react";
import LoadingSpinner from "./loading";
import { LessonsProvider } from "@/features/lessons/context/LessonsContext";

export default function LessonsLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <LessonsProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="min-h-screen">
          {children}
        </div>
      </Suspense>
    </LessonsProvider>
  );
} 