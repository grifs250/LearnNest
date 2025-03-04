"use client";

import { useState, useEffect } from 'react';
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { SupabaseClient } from '@supabase/supabase-js';

type TeacherWorkHours = {
  id: string;
  teacher_id: string;
  day_0?: string | null; // Sunday
  day_1?: string | null; // Monday
  day_2?: string | null; // Tuesday
  day_3?: string | null; // Wednesday
  day_4?: string | null; // Thursday
  day_5?: string | null; // Friday
  day_6?: string | null; // Saturday
  created_at?: string | null;
  updated_at?: string | null;
};

export function useWorkHours() {
  const [workHours, setWorkHours] = useState<TeacherWorkHours | null>(null);
  const [loading, setLoading] = useState(true);
  const { supabase, isLoading: isClientLoading } = useClerkSupabase();
  const { user } = useUser();

  useEffect(() => {
    if (isClientLoading || !user) return;

    const fetchWorkHours = async () => {
      try {
        // First, check if the table exists
        const { error: tableError } = await (supabase as SupabaseClient).rpc('check_table_exists', {
          table_name: 'teacher_work_hours'
        });

        if (tableError) {
          // Create the table if it doesn't exist
          await (supabase as SupabaseClient).rpc('create_work_hours_table');
        }

        const { data, error } = await (supabase as SupabaseClient)
          .from('teacher_work_hours')
          .select('*')
          .eq('teacher_id', user.id)
          .single();

        if (error) throw error;

        setWorkHours(data);
      } catch (error) {
        console.error('Error fetching work hours:', error);
        toast.error('Failed to load work hours');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkHours();
  }, [supabase, user, isClientLoading]);

  const updateWorkHours = async (updatedHours: Partial<TeacherWorkHours>) => {
    if (!user) {
      toast.error('You must be logged in to update work hours');
      return;
    }

    try {
      const { error } = await (supabase as SupabaseClient)
        .from('teacher_work_hours')
        .upsert({
          teacher_id: user.id,
          ...updatedHours,
        });

      if (error) throw error;

      setWorkHours(prev => prev ? { ...prev, ...updatedHours } : { teacher_id: user.id, ...updatedHours } as TeacherWorkHours);
      toast.success('Work hours updated successfully');
    } catch (error) {
      console.error('Error updating work hours:', error);
      toast.error('Failed to update work hours');
    }
  };

  return {
    workHours,
    loading: loading || isClientLoading,
    updateWorkHours,
  };
} 