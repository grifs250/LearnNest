"use client";

import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase/db';
import { Tables } from '@/types/supabase.types';

export function useAvailableLessons() {
  const [availableSubjects, setAvailableSubjects] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('subject_id')
          .eq('is_active', true);

        if (error) throw error;

        const subjectsSet = new Set(
          data.map(lesson => lesson.subject_id)
        );
        setAvailableSubjects(subjectsSet);
      } catch (error) {
        console.error('Error fetching available subjects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();

    // Set up real-time subscription
    const subscription = supabase
      .channel('lessons_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lessons'
        },
        async () => {
          // Refetch subjects when changes occur
          await fetchSubjects();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { availableSubjects, isLoading };
} 