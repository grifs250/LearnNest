"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Lesson } from "../types";
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
      setLessons(data);
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