"use client";

import { useState, useEffect } from "react";
import { Lesson } from "@/types/database";
import { dbService } from "@/lib/supabase/db";
import { toast } from "react-hot-toast";

export function useLessons(subjectId: string) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchLessons() {
      try {
        setLoading(true);
        const data = await dbService.getLessons({ subject_id: subjectId });
        setLessons(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching lessons:", err);
        setError(err instanceof Error ? err : new Error("Failed to load lessons"));
        toast.error("Neizdevās ielādēt nodarbības");
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, [subjectId]);

  return { lessons, loading, error, refetch: () => setLoading(true) };
} 