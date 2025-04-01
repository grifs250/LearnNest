"use client";

import { useState, useEffect } from "react";
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import type { Database } from '@/lib/types';
import { toast } from 'react-hot-toast';

type Lesson = Database['public']['Tables']['lessons']['Row'];

export function useAvailableLessons(filters?: {
  categoryId?: string;
  subjectId?: string;
  teacherId?: string;
  isActive?: boolean;
}) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { supabase, isLoading: isClientLoading } = useClerkSupabase();

  useEffect(() => {
    if (isClientLoading || !supabase) return;

    const fetchLessons = async () => {
      try {
        let query = supabase
          .from('lessons')
          .select(`
            *,
            teacher:teacher_id(
              id,
              full_name,
              avatar_url,
              metadata
            ),
            subject:subject_id(
              id,
              name,
              category_id
            ),
            lesson_schedules(
              id,
              start_time,
              end_time,
              is_available,
              bookings(*)
            )
          `);

        // Apply filters
        if (filters?.categoryId) {
          query = query.eq('subject.category_id', filters.categoryId);
        }
        if (filters?.subjectId) {
          query = query.eq('subject_id', filters.subjectId);
        }
        if (filters?.teacherId) {
          query = query.eq('teacher_id', filters.teacherId);
        }
        if (filters?.isActive !== undefined) {
          query = query.eq('is_active', filters.isActive);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) throw supabaseError;

        setLessons(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch lessons'));
        toast.error('Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [supabase, filters?.categoryId, filters?.subjectId, filters?.teacherId, filters?.isActive, isClientLoading]);

  return {
    lessons,
    loading: loading || isClientLoading,
    error,
    refetch: () => setLoading(true), // This will trigger a re-fetch due to the loading dependency
  };
} 