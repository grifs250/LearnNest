// import { db } from "@/lib/firebase/client";
// import { doc, updateDoc } from "firebase/firestore";
import { supabase } from '@/lib/supabase/db';
import { WorkHours } from "../types";
import { toast } from 'react-hot-toast';

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