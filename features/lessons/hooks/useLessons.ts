"use client";

import { useState, useEffect } from "react";
import { Lesson } from "../types";
import { lessonService } from "../services/lessonService";
import { toast } from "react-hot-toast";

export function useLessons(subjectId: string) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLessons() {
      try {
        setLoading(true);
        const data = await lessonService.fetchLessonsBySubject(subjectId);
        setLessons(data);
      } catch (err) {
        console.error("Error fetching lessons:", err);
        setError("Failed to load lessons");
        toast.error("Neizdevās ielādēt nodarbības");
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, [subjectId]);

  return { lessons, loading, error };
} 