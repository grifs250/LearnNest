"use client";

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { WorkHours, TimeRange, DAYS } from "../types";
import { toast } from "react-hot-toast";

export function useWorkHours(teacherId: string) {
  const [workHours, setWorkHours] = useState<WorkHours>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkHours() {
      try {
        const teacherDoc = await getDoc(doc(db, "users", teacherId));
        const rawWorkHours = teacherDoc.data()?.workHours as { [key: string]: { timeSlots: TimeRange | TimeRange[] } } | undefined;
        
        if (teacherDoc.exists() && rawWorkHours) {
          // Convert to numeric format if needed
          const formattedWorkHours: WorkHours = {};
          Object.entries(rawWorkHours).forEach(([day, dayData]) => {
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