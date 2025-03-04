"use client";

import { LessonDetails } from "@/features/lessons/components";

interface LessonParams {
  category: string;
  subjectId: string;
  lessonId: string;
}

export const ClientComponents = {
  LessonDetail: function({ params }: { params: LessonParams }) {
    const { category, subjectId, lessonId } = params;
    
    return (
      <div className="container mx-auto">
        <LessonDetails 
          category={category}
          subjectId={subjectId}
          lessonId={lessonId}
        />
      </div>
    );
  }
};