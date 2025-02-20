"use client";

import { db } from "@/lib/firebase/client";
import { doc, updateDoc } from "firebase/firestore";
import { TeacherWorkHoursProps, TimeRange, DAYS } from "../types";
import { useWorkHours } from "../hooks/useWorkHours";
import { toast } from "react-hot-toast";

export function TeacherWorkHours({ teacherId }: TeacherWorkHoursProps) {
  const { workHours, setWorkHours, loading } = useWorkHours(teacherId);

  const handleWorkHoursUpdate = async (dayId: number, range: TimeRange) => {
    try {
      const updatedWorkHours = {
        ...workHours,
        [dayId]: {
          enabled: true,
          timeSlots: [range]
        }
      };

      await updateDoc(doc(db, "users", teacherId), {
        workHours: updatedWorkHours
      });
      
      setWorkHours(updatedWorkHours);
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
                value={workHours[day.id]?.timeSlots[0]?.start || '09:00'}
                onChange={(e) => {
                  const currentRange = workHours[day.id]?.timeSlots[0] || { start: '09:00', end: '17:00' };
                  handleWorkHoursUpdate(day.id, { ...currentRange, start: e.target.value });
                }}
              />
              <span>-</span>
              <input
                type="time"
                className="input input-bordered"
                value={workHours[day.id]?.timeSlots[0]?.end || '17:00'}
                onChange={(e) => {
                  const currentRange = workHours[day.id]?.timeSlots[0] || { start: '09:00', end: '17:00' };
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