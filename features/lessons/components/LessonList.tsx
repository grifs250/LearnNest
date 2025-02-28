'use client';

import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import { useEffect, useState } from 'react';
import type { Database } from '@/types/supabase.types';

type Lesson = Database['public']['Tables']['lessons']['Row'];

export function LessonList() {
  const { supabase, isLoading } = useClerkSupabase();
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    if (isLoading) return;

    const fetchLessons = async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*');

      if (error) {
        console.error('Error fetching lessons:', error);
        return;
      }

      setLessons(data || []);
    };

    fetchLessons();
  }, [supabase, isLoading]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="card bg-base-200 p-4">
          <h3 className="text-lg font-semibold">{lesson.title}</h3>
          <p>{lesson.description}</p>
        </div>
      ))}
    </div>
  );
} 