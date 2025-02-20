"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Lesson } from "@/features/lessons/types";
import { toast } from "react-hot-toast";

export function useLessons(courseId: string) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLessons() {
      try {
        setLoading(true);
        const q = query(
          collection(db, "lessons"), 
          where("courseId", "==", courseId)
        );
        const querySnapshot = await getDocs(q);
        
        setLessons(querySnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Lesson)));
        
      } catch (err) {
        console.error("Error fetching lessons:", err);
        setError("Failed to load lessons");
        toast.error("Neizdevās ielādēt nodarbības");
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, [courseId]);

  return { lessons, loading, error };
} 