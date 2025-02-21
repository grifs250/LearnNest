"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/db';
import { WorkHours, TimeRange, DAYS } from "../types";
import { toast } from "react-hot-toast";

export async function getWorkHours(teacherId: string): Promise<WorkHours> {
  try {
    const { data, error } = await supabase
      .from('work_hours')
      .select('*')
      .eq('teacher_id', teacherId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching work hours:', error);
    throw error;
  }
}

export function useWorkHours(teacherId: string) {
  const [workHours, setWorkHours] = useState<WorkHours>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkHours() {
      try {
        const teacherDoc = await getWorkHours(teacherId);
        
        if (teacherDoc) {
          // Convert to numeric format if needed
          const formattedWorkHours: WorkHours = {};
          Object.entries(teacherDoc).forEach(([day, dayData]) => {
            const numericDay = parseInt(day, 10);
            if (!isNaN(numericDay) && numericDay >= 0 && numericDay <= 6) {
              formattedWorkHours[numericDay] = {
                enabled: true,
                timeSlots: Array.isArray(dayData.timeSlots) ? dayData.timeSlots : [dayData.timeSlots]
              };
            }
          });
          
          setWorkHours(formattedWorkHours);
        } else {
          // Initialize with default empty schedule
          const defaultWorkHours: WorkHours = {};
          DAYS.forEach(day => {
            defaultWorkHours[day.id] = {
              enabled: false,
              timeSlots: [{ start: '09:00', end: '17:00' }]
            };
          });
          setWorkHours(defaultWorkHours);
        }
      } catch (error) {
        console.error("Error fetching work hours:", error);
        toast.error("Neizdevās ielādēt darba laikus");
      } finally {
        setLoading(false);
      }
    }

    fetchWorkHours();
  }, [teacherId]);

  return {
    workHours,
    setWorkHours,
    loading
  };
} 