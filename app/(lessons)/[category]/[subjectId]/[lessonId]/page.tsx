"use client";

import LessonDetails from "@/components/LessonDetails";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LessonDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  return (
    <LessonDetails 
      category={params.category as string}
      subjectId={params.subjectId as string}
      lessonId={params.lessonId as string}
    />
  );
}

export default function LessonDetailsPage() {
  return (
    <div className="container mx-auto">
      <Suspense fallback={<div>Loading...</div>}>
        <LessonDetailsContent />
      </Suspense>
    </div>
  );
} 