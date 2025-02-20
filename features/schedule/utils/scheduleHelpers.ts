import { db } from "@/lib/firebase/client";
import { doc, updateDoc } from "firebase/firestore";
import { WorkHours } from "../types";

export async function saveSchedule(schedule: WorkHours, userId: string): Promise<void> {
  await updateDoc(doc(db, "users", userId), {
    workHours: schedule
  });
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