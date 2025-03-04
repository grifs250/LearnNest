// import { db } from "@/lib/firebase/client";
// import { doc, updateDoc } from "firebase/firestore";
import { supabase } from '@/lib/supabase/db';
import { WorkHours } from "../types";
import { toast } from 'react-hot-toast';
import type { Database } from '../../../types/supabase.types';
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

type Schedule = Database['public']['Tables']['lesson_schedules']['Row'];

export async function saveSchedule(schedule: WorkHours, userId: string): Promise<void> {
  try {
    // await updateDoc(doc(db, "users", userId), {
    //   workHours: schedule
    // });
    toast.success('Grafiks saglabāts');
  } catch (error) {
    // console.error('Error saving schedule:', error);
    toast.error('Kļūda saglabājot grafiku');
    throw error;
  }
}

export function getNextFourWeeksDates(dayId: string): string[] {
  const targetDay = parseInt(dayId, 10);
  if (isNaN(targetDay) || targetDay < 0 || targetDay > 6) return [];
  
  const today = new Date();
  const dates: string[] = [];

  // Find the next occurrence of the target day
  let date = new Date(today);
  date.setDate(date.getDate() + (targetDay + 7 - date.getDay()) % 7);

  // Get 4 weeks of dates
  for (let i = 0; i < 4; i++) {
    dates.push(date.toISOString().split('T')[0]);
    date.setDate(date.getDate() + 7);
  }

  return dates;
}

export async function getTeacherWorkHours(supabase: SupabaseClient, teacherId: string) {
  const { data, error } = await supabase
    .from('teacher_work_hours')
    .select('*')
    .eq('teacher_id', teacherId)
    .single();

  if (error) {
    console.error('Error fetching work hours:', error);
    return null;
  }

  return data as TeacherWorkHours;
}

export async function getTeacherSchedule(supabase: SupabaseClient, teacherId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('lesson_schedules')
    .select(`
      *,
      lesson:lesson_id(*),
      bookings(*)
    `)
    .eq('teacher_id', teacherId)
    .gte('start_time', startDate)
    .lte('end_time', endDate);

  if (error) {
    console.error('Error fetching schedule:', error);
    return [];
  }

  return data || [];
}

export function isTimeSlotAvailable(schedule: Schedule[], startTime: string, endTime: string): boolean {
  return !schedule.some(slot => {
    const slotStart = new Date(slot.start_time).getTime();
    const slotEnd = new Date(slot.end_time).getTime();
    const checkStart = new Date(startTime).getTime();
    const checkEnd = new Date(endTime).getTime();

    return (
      (checkStart >= slotStart && checkStart < slotEnd) ||
      (checkEnd > slotStart && checkEnd <= slotEnd) ||
      (checkStart <= slotStart && checkEnd >= slotEnd)
    );
  });
}

export function generateTimeSlots(date: string, workHours: TeacherWorkHours): { start: string; end: string }[] {
  const slots: { start: string; end: string }[] = [];
  const dayOfWeek = new Date(date).getDay();
  const dayHours = workHours[`day_${dayOfWeek}` as keyof TeacherWorkHours];

  if (!dayHours) return slots;

  const [startHour, endHour] = dayHours.split('-');
  const startTime = new Date(`${date}T${startHour}:00`);
  const endTime = new Date(`${date}T${endHour}:00`);

  while (startTime < endTime) {
    const slotEnd = new Date(startTime);
    slotEnd.setMinutes(startTime.getMinutes() + 60);

    if (slotEnd <= endTime) {
      slots.push({
        start: startTime.toISOString(),
        end: slotEnd.toISOString(),
      });
    }

    startTime.setMinutes(startTime.getMinutes() + 60);
  }

  return slots;
} 