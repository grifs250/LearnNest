"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export function useAvailableLessons() {
  const [availableSubjects, setAvailableSubjects] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const lessonsRef = collection(db, "lessons");
    
    const unsubscribe = onSnapshot(lessonsRef, (snapshot) => {
      const subjectsWithLessonsSet = new Set(
        snapshot.docs.map(doc => doc.data().subjectId)
      );
      setAvailableSubjects(subjectsWithLessonsSet);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { availableSubjects, isLoading };
} 