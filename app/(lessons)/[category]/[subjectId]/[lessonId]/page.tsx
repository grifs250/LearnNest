"use client";

import { LessonDetails } from "@/features/lessons/components";
import { useParams } from "next/navigation";

export default function LessonDetailsPage() {
  const params = useParams();
  
  return (
    <div className="container mx-auto">
      <LessonDetails 
        category={params.category as string}
        subjectId={params.subjectId as string}
        lessonId={params.lessonId as string}
      />
    </div>
  );
} 