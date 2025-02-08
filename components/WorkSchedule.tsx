"use client";

import { useState, useEffect } from 'react';
import { db, auth } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const DAYS = [
  "Pirmdiena",
  "Otrdiena",
  "Trešdiena",
  "Ceturtdiena",
  "Piektdiena",
  "Sestdiena",
  "Svētdiena"
];

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeSlot[];
}

type WeekSchedule = {
  [key: string]: DaySchedule;
};

export default function WorkSchedule() {
  const [schedule, setSchedule] = useState<WeekSchedule>(() => 
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: { 
        enabled: false, 
        timeSlots: [{ start: "09:00", end: "17:00" }]
      }
    }), {} as WeekSchedule)
  );
  const [saving, setSaving] = useState(false);

  // Load existing schedule
  useEffect(() => {
    async function loadSchedule() {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().weeklySchedule) {
        setSchedule(docSnap.data().weeklySchedule);
      }
    }
    loadSchedule();
  }, []);

  const handleToggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { 
        ...prev[day], 
        enabled: !prev[day].enabled 
      }
    }));
  };

  const handleTimeChange = (day: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.map((slot, idx) =>
          idx === slotIndex ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const addTimeSlot = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [
          ...prev[day].timeSlots,
          { start: "09:00", end: "17:00" }
        ]
      }
    }));
  };

  const removeTimeSlot = (day: string, slotIndex: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.filter((_, idx) => idx !== slotIndex)
      }
    }));
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      // Save weekly schedule
      await updateDoc(doc(db, "users", user.uid), {
        weeklySchedule: schedule
      });

      // Generate and save work hours
      const workHours = Object.entries(schedule).reduce((acc, [day, { enabled, timeSlots }]) => {
        if (enabled) {
          const dates = getNextFourWeeksDates(day);
          dates.forEach(date => {
            acc[date] = timeSlots.map(({ start, end }) => ({ start, end }));
          });
        }
        return acc;
      }, {} as Record<string, Array<{ start: string; end: string }>>);

      await updateDoc(doc(db, "users", user.uid), { workHours });
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
        {DAYS.map(day => {
          const daySchedule = schedule[day] || { 
            enabled: false, 
            timeSlots: [{ start: "09:00", end: "17:00" }]
          };
          
          return (
            <div key={day} className="flex flex-col gap-4 p-3 bg-base-200 rounded">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={daySchedule.enabled}
                    onChange={() => handleToggleDay(day)}
                    className="checkbox"
                  />
                  <span className="font-medium">{day}</span>
                </label>
                
                {daySchedule.enabled && (
                  <button
                    onClick={() => addTimeSlot(day)}
                    className="btn btn-sm btn-secondary"
                  >
                    + Pievienot laiku
                  </button>
                )}
              </div>
              
              {daySchedule.enabled && (
                <div className="space-y-2">
                  {daySchedule.timeSlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span>No:</span>
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => handleTimeChange(day, idx, 'start', e.target.value)}
                          className="input input-bordered input-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Līdz:</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => handleTimeChange(day, idx, 'end', e.target.value)}
                          className="input input-bordered input-sm"
                        />
                      </div>
                      {daySchedule.timeSlots.length > 1 && (
                        <button
                          onClick={() => removeTimeSlot(day, idx)}
                          className="btn btn-sm btn-error"
                        >
                          Dzēst
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
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

// Helper function to get next 4 weeks of dates for a given day
function getNextFourWeeksDates(dayName: string): string[] {
  const days = ["Svētdiena", "Pirmdiena", "Otrdiena", "Trešdiena", "Ceturtdiena", "Piektdiena", "Sestdiena"];
  const targetDay = days.indexOf(dayName);
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
