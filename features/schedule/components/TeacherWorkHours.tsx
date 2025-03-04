"use client";

// import { db } from "@/lib/firebase/client";
// import { doc, updateDoc } from "firebase/firestore";
import { supabase } from "@/lib/supabase/client";
import { TeacherWorkHoursProps, TimeRange, DAYS, WorkHours } from "../types";
import { useWorkHours } from "../hooks/useWorkHours";
import { toast } from "react-hot-toast";

export function TeacherWorkHours({ teacherId }: TeacherWorkHoursProps) {
  const { workHours, loading, updateWorkHours } = useWorkHours();

  const handleWorkHoursUpdate = async (dayId: number, range: TimeRange) => {
    try {
      const updatedWorkHours: Partial<WorkHours> = {
        ...workHours,
        [dayId]: {
          enabled: true,
          timeSlots: [range]
        }
      };

      // Use the updateWorkHours function from the hook instead of Firebase updateDoc
      await updateWorkHours({
        [`day_${dayId}`]: JSON.stringify({
          enabled: true,
          timeSlots: [range]
        })
      });
      
      toast.success('Darba laiks atjaunināts!');
    } catch (error) {
      console.error("Error updating work hours:", error);
      toast.error('Kļūda atjauninot darba laiku');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Convert the database format (day_0, day_1, etc.) to the WorkHours format expected by the UI
  const formattedWorkHours: WorkHours = {};
  
  if (workHours) {
    DAYS.forEach(day => {
      const dayKey = `day_${day.id}` as keyof typeof workHours;
      const dayData = workHours[dayKey];
      
      if (dayData) {
        try {
          const parsedData = JSON.parse(dayData as string);
          formattedWorkHours[day.id] = parsedData;
        } catch (e) {
          // If JSON parsing fails, set default values
          formattedWorkHours[day.id] = {
            enabled: false,
            timeSlots: [{ start: '09:00', end: '17:00' }]
          };
        }
      } else {
        // Default value if no data exists
        formattedWorkHours[day.id] = {
          enabled: false,
          timeSlots: [{ start: '09:00', end: '17:00' }]
        };
      }
    });
  }

  return (
    <div className="space-y-4">
      {DAYS.map(day => (
        <div key={day.id} className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold">{day.name}</h3>
            <div className="flex gap-4">
              <input
                type="time"
                className="input input-bordered"
                value={formattedWorkHours[day.id]?.timeSlots[0]?.start || '09:00'}
                onChange={(e) => {
                  const currentRange = formattedWorkHours[day.id]?.timeSlots[0] || { start: '09:00', end: '17:00' };
                  handleWorkHoursUpdate(day.id, { ...currentRange, start: e.target.value });
                }}
              />
              <span>-</span>
              <input
                type="time"
                className="input input-bordered"
                value={formattedWorkHours[day.id]?.timeSlots[0]?.end || '17:00'}
                onChange={(e) => {
                  const currentRange = formattedWorkHours[day.id]?.timeSlots[0] || { start: '09:00', end: '17:00' };
                  handleWorkHoursUpdate(day.id, { ...currentRange, end: e.target.value });
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 