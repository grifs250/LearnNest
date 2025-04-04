"use client";

import { useState, useEffect } from 'react';
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { TeacherAvailability, TeacherAvailabilityInsert } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export type DayTimeRange = {
  start: string; // Format: "HH:MM"
  end: string;   // Format: "HH:MM"
};

export type AvailabilityFormData = {
  [key: number]: { // day of week (0-6)
    enabled: boolean;
    timeRanges: DayTimeRange[];
  };
};

export function useTeacherAvailability() {
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [formattedAvailability, setFormattedAvailability] = useState<AvailabilityFormData>({});
  const [loading, setLoading] = useState(true);
  const { supabase, isLoading: isClientLoading } = useClerkSupabase();
  const { user } = useUser();

  // Helper to convert from DB to form format
  const formatForForm = (availabilityList: TeacherAvailability[]): AvailabilityFormData => {
    const result: AvailabilityFormData = {};
    
    // Initialize all days (0-6)
    for (let i = 0; i <= 6; i++) {
      result[i] = {
        enabled: false,
        timeRanges: [{ start: '09:00', end: '17:00' }]
      };
    }

    // Populate with actual data
    availabilityList.forEach(item => {
      if (!result[item.day_of_week]) {
        result[item.day_of_week] = {
          enabled: false,
          timeRanges: []
        };
      }

      // Convert time format from "HH:MM:SS" to "HH:MM"
      const start = item.start_time.substring(0, 5);
      const end = item.end_time.substring(0, 5);
      
      result[item.day_of_week].enabled = item.is_active;
      result[item.day_of_week].timeRanges.push({ start, end });
    });

    return result;
  };

  useEffect(() => {
    if (isClientLoading || !user) return;

    const fetchAvailability = async () => {
      try {
        // Fetch availability data
        const { data, error } = await (supabase as SupabaseClient)
          .from('teacher_availability')
          .select('*')
          .eq('teacher_id', user.id);

        if (error) throw error;

        setAvailability(data || []);
        setFormattedAvailability(formatForForm(data || []));
      } catch (error) {
        console.error('Error fetching teacher availability:', error);
        toast.error('Neizdevās ielādēt pieejamības datus');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [supabase, user, isClientLoading]);

  const updateAvailability = async (dayOfWeek: number, ranges: DayTimeRange[], enabled: boolean = true) => {
    if (!user) {
      toast.error('Jums jāpieslēdzas, lai atjauninātu pieejamību');
      return;
    }

    try {
      // First, delete existing entries for this day
      const { error: deleteError } = await (supabase as SupabaseClient)
        .from('teacher_availability')
        .delete()
        .eq('teacher_id', user.id)
        .eq('day_of_week', dayOfWeek);

      if (deleteError) throw deleteError;

      // Then insert new entries
      if (enabled && ranges.length > 0) {
        const newEntries: TeacherAvailabilityInsert[] = ranges.map(range => ({
          teacher_id: user.id,
          day_of_week: dayOfWeek,
          start_time: `${range.start}:00`, // Add seconds
          end_time: `${range.end}:00`,     // Add seconds
          is_active: enabled
        }));

        const { error: insertError } = await (supabase as SupabaseClient)
          .from('teacher_availability')
          .insert(newEntries);

        if (insertError) throw insertError;
      }

      // Update local state
      const updatedAvailability = availability.filter(
        a => a.day_of_week !== dayOfWeek
      );

      if (enabled && ranges.length > 0) {
        ranges.forEach(range => {
          updatedAvailability.push({
            id: crypto.randomUUID(),
            teacher_id: user.id,
            day_of_week: dayOfWeek,
            start_time: `${range.start}:00`,
            end_time: `${range.end}:00`,
            is_active: enabled,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      }

      setAvailability(updatedAvailability);
      setFormattedAvailability(formatForForm(updatedAvailability));
      
      toast.success('Pieejamība veiksmīgi atjaunināta');
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Neizdevās atjaunināt pieejamību');
    }
  };

  return {
    availability,
    formattedAvailability,
    loading: loading || isClientLoading,
    updateAvailability,
  };
} 