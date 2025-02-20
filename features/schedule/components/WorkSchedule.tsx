"use client";

import { useState, useEffect } from 'react';
import { auth } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { WorkScheduleProps, TimeSlotRowProps, WorkHours, TimeRange, DAYS } from "../types";
import { saveSchedule } from "../utils/scheduleHelpers";
import { toast } from "react-hot-toast";

function TimeSlotRow({ slot, dayId, index, canDelete, onTimeChange, onRemove }: TimeSlotRowProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span>No:</span>
        <input
          type="time"
          value={slot.start}
          onChange={(e) => onTimeChange(dayId, index, 'start', e.target.value)}
          className="input input-bordered input-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <span>Līdz:</span>
        <input
          type="time"
          value={slot.end}
          onChange={(e) => onTimeChange(dayId, index, 'end', e.target.value)}
          className="input input-bordered input-sm"
        />
      </div>
      {canDelete && (
        <button
          onClick={() => onRemove(dayId, index)}
          className="btn btn-sm btn-error"
        >
          Dzēst
        </button>
      )}
    </div>
  );
}

export function WorkSchedule({ initialWorkHours }: WorkScheduleProps = {}) {
  const [schedule, setSchedule] = useState<WorkHours>(() => {
    const defaultSchedule: WorkHours = {};
    DAYS.forEach(day => {
      defaultSchedule[day.id] = {
        enabled: false,
        timeSlots: [{ start: "09:00", end: "17:00" }]
      };
    });
    return defaultSchedule;
  });
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSchedule() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().workHours) {
          setSchedule(docSnap.data().workHours);
        }
      } catch (error) {
        console.error("Error loading schedule:", error);
        toast.error("Neizdevās ielādēt grafiku");
      }
    }
    loadSchedule();
  }, []);

  const handleToggleDay = (dayId: number) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        enabled: !prev[dayId].enabled
      }
    }));
  };

  const handleTimeChange = (dayId: number, slotIndex: number, field: keyof TimeRange, value: string) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        timeSlots: prev[dayId].timeSlots.map((slot, idx) =>
          idx === slotIndex ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const addTimeSlot = (dayId: number) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        timeSlots: [...prev[dayId].timeSlots, { start: "09:00", end: "17:00" }]
      }
    }));
  };

  const removeTimeSlot = (dayId: number, slotIndex: number) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        timeSlots: prev[dayId].timeSlots.filter((_, idx) => idx !== slotIndex)
      }
    }));
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("Nav pieejams lietotājs");
      return;
    }

    setSaving(true);
    try {
      await saveSchedule(schedule, user.uid);
      toast.success("Darba grafiks saglabāts!");
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Kļūda saglabājot grafiku");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 bg-base-100 p-6 rounded-lg shadow">
      <div className="grid gap-4">
        {DAYS.map(day => (
          <div key={day.id} className="flex flex-col gap-4 p-3 bg-base-200 rounded">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={schedule[day.id].enabled}
                  onChange={() => handleToggleDay(day.id)}
                  className="checkbox"
                />
                <span className="font-medium">{day.name}</span>
              </label>
              
              {schedule[day.id].enabled && (
                <button
                  onClick={() => addTimeSlot(day.id)}
                  className="btn btn-sm btn-secondary"
                >
                  + Pievienot laiku
                </button>
              )}
            </div>
            
            {schedule[day.id].enabled && (
              <div className="space-y-2">
                {schedule[day.id].timeSlots.map((slot, idx) => (
                  <TimeSlotRow
                    key={`${day.id}-${idx}`}
                    slot={slot}
                    dayId={day.id}
                    index={idx}
                    canDelete={schedule[day.id].timeSlots.length > 1}
                    onTimeChange={handleTimeChange}
                    onRemove={removeTimeSlot}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary w-full"
      >
        {saving ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Saglabā...
          </>
        ) : (
          "Saglabāt grafiku"
        )}
      </button>
    </div>
  );
} 