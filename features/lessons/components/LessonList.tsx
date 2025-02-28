'use client';

import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import { useEffect, useState } from 'react';

export function LessonList() {
  const { supabase, isLoading } = useClerkSupabase();
  const [lessons, setLessons] = useState([]);

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

      setLessons(data);
    };

    fetchLessons();
  }, [supabase, isLoading]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {lessons.map((lesson) => (
        <div key={lesson.id}>{lesson.title}</div>
      ))}
    </div>
  );
} 