"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Lesson, DbLesson } from "../types";
import { lessonService } from "../services";
import { toast } from "react-hot-toast";

interface LessonsContextType {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
  refreshLessons: () => Promise<void>;
  setCurrentCategory: (category: string) => void;
}

const LessonsContext = createContext<LessonsContextType | undefined>(undefined);

// Convert DbLesson to Lesson
const convertDbLessonToLesson = (dbLesson: DbLesson): Lesson => {
  return {
    id: dbLesson.id,
    title: dbLesson.title,
    description: dbLesson.description || null,
    price: dbLesson.price,
    duration: dbLesson.duration,
    subject_id: dbLesson.subject_id,
    teacher_id: dbLesson.teacher_id,
    image_url: null,
    video_url: null,
    is_active: dbLesson.is_active ?? false,
    is_featured: false,
    is_online: false,
    max_students: dbLesson.max_students ?? 1,
    created_at: dbLesson.created_at || new Date().toISOString(),
    updated_at: dbLesson.updated_at,
    location: null,
    difficulty_level: null,
    language: 'lv', // Default to Latvian
    tags: null
  };
};

export function LessonsProvider({ children }: { children: React.ReactNode }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('');

  const refreshLessons = async () => {
    if (!currentCategory) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await lessonService.fetchLessonsBySubject(currentCategory);
      // Convert DbLesson[] to Lesson[]
      const convertedLessons = data.map((dbLesson: any) => convertDbLessonToLesson(dbLesson));
      setLessons(convertedLessons);
    } catch (err) {
      console.error("Error fetching lessons:", err);
      setError("Failed to load lessons");
      toast.error("Neizdevās ielādēt nodarbības");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentCategory) {
      refreshLessons();
    }
  }, [currentCategory]);

  return (
    <LessonsContext.Provider value={{
      lessons,
      loading,
      error,
      refreshLessons,
      setCurrentCategory
    }}>
      {children}
    </LessonsContext.Provider>
  );
}

export function useLessonsContext() {
  const context = useContext(LessonsContext);
  if (context === undefined) {
    throw new Error("useLessonsContext must be used within a LessonsProvider");
  }
  return context;
} 