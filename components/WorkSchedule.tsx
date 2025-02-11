"use client";

import { useState, useEffect } from 'react';
import { db, auth } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { WorkHours, TimeRange, } from "@/types/lesson";

const DAYS = [
  { id: 0, name: 'Svētdiena' },
  { id: 1, name: 'Pirmdiena' },
  { id: 2, name: 'Otrdiena' },
  { id: 3, name: 'Trešdiena' },
  { id: 4, name: 'Ceturtdiena' },
  { id: 5, name: 'Piektdiena' },
  { id: 6, name: 'Sestdiena' }
];

interface WorkScheduleProps {
  readonly initialWorkHours?: WorkHours;
}

async function saveSchedule(schedule: WorkHours, userId: string): Promise<void> {
  console.log('Saving schedule:', schedule);
  
  await updateDoc(doc(db, "users", userId), {
    workHours: schedule
  });
}

export default function WorkSchedule({ initialWorkHours }: WorkScheduleProps = {}) {
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

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().workHours) {
        setSchedule(docSnap.data().workHours);
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
    if (!user) return;

    setSaving(true);
    try {
      await saveSchedule(schedule, user.uid);
      alert("Darba grafiks saglabāts!");
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Kļūda saglabājot grafiku");
    }
    setSaving(false);
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
        {saving ? "Saglabā..." : "Saglabāt grafiku"}
      </button>
    </div>
  );
}

interface TimeSlotRowProps {
  readonly slot: TimeRange;
  readonly dayId: number;
  readonly index: number;
  readonly canDelete: boolean;
  readonly onTimeChange: (dayId: number, index: number, field: keyof TimeRange, value: string) => void;
  readonly onRemove: (dayId: number, index: number) => void;
}

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

// Helper function to get next 4 weeks of dates for a given day
function getNextFourWeeksDates(dayId: string): string[] {
  const targetDay = parseInt(dayId, 10); // Convert string ID to number
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
