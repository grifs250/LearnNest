'use client';

import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import { useEffect, useState } from 'react';
import type { Database } from '@/lib/types';

type Lesson = Database['public']['Tables']['lessons']['Row'];

export function LessonList() {
  const { user, profile } = useUser();
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const fetchLessons = async () => {
    // RLS will automatically filter based on user role
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching lessons:', error);
      return;
    }

    setLessons(data || []);
  };

  useEffect(() => {
    fetchLessons();
  }, []);

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