"use client";

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Dialog } from "./Dialog";

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeSlot[];
}

interface WeekSchedule {
  [key: string]: DaySchedule;
}

interface WorkScheduleProps {
  readonly teacherId: string;
  readonly isEditable?: boolean;
  readonly onScheduleUpdate?: () => void;
}

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const DAY_NAMES: Record<DayKey, string> = {
  monday: "Pirmdiena",
  tuesday: "Otrdiena",
  wednesday: "Trešdiena",
  thursday: "Ceturtdiena",
  friday: "Piektdiena",
  saturday: "Sestdiena",
  sunday: "Svētdiena"
};

const DAYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
];

export default function WorkSchedule({ teacherId, isEditable = false, onScheduleUpdate }: WorkScheduleProps) {
  const [schedule, setSchedule] = useState<WeekSchedule>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const docRef = doc(db, "workSchedules", teacherId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setSchedule(docSnap.data() as WeekSchedule);
        } else {
          // Initialize empty schedule
          const emptySchedule: WeekSchedule = {};
          DAYS.forEach(day => {
            emptySchedule[day] = {
              enabled: false,
              timeSlots: [{
                start: "09:00",
                end: "17:00"
              }]
            };
          });
          setSchedule(emptySchedule);
        }
      } catch (err) {
        console.error("Error loading schedule:", err);
        setError("Neizdevās ielādēt darba grafiku");
        setShowErrorDialog(true);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [teacherId]);

  const handleSave = async () => {
    if (!isEditable) return;
    setSaving(true);
    setError(null);

    try {
      await setDoc(doc(db, "workSchedules", teacherId), schedule);
      onScheduleUpdate?.();
    } catch (err) {
      console.error("Error saving schedule:", err);
      setError("Neizdevās saglabāt darba grafiku");
      setShowErrorDialog(true);
    } finally {
      setSaving(false);
    }
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

  const removeTimeSlot = (day: string, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.filter((_, i) => i !== index)
      }
    }));
  };

  if (loading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div className="space-y-4">
      {DAYS.map(day => (
        <div key={day} className="card bg-base-200 p-4">
          <div className="flex items-center gap-4 mb-4">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={schedule[day]?.enabled}
              onChange={(e) => setSchedule(prev => ({
                ...prev,
                [day]: {
                  ...prev[day],
                  enabled: e.target.checked
                }
              }))}
              disabled={!isEditable}
            />
            <h3 className="font-bold">{DAY_NAMES[day]}</h3>
          </div>

          {schedule[day]?.enabled && (
            <div className="space-y-2">
              {schedule[day]?.timeSlots.map((slot, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="time"
                    className="input input-bordered"
                    value={slot.start}
                    onChange={(e) => {
                      const newSchedule = { ...schedule };
                      newSchedule[day].timeSlots[index].start = e.target.value;
                      setSchedule(newSchedule);
                    }}
                    disabled={!isEditable}
                  />
                  <span>-</span>
                  <input
                    type="time"
                    className="input input-bordered"
                    value={slot.end}
                    onChange={(e) => {
                      const newSchedule = { ...schedule };
                      newSchedule[day].timeSlots[index].end = e.target.value;
                      setSchedule(newSchedule);
                    }}
                    disabled={!isEditable}
                  />
                  {isEditable && schedule[day].timeSlots.length > 1 && (
                    <button
                      onClick={() => removeTimeSlot(day, index)}
                      className="btn btn-ghost btn-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {isEditable && (
                <button
                  onClick={() => addTimeSlot(day)}
                  className="btn btn-ghost btn-sm"
                >
                  + Pievienot laiku
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {isEditable && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? "Saglabā..." : "Saglabāt"}
          </button>
        </div>
      )}

      <Dialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Kļūda"
        description={error || ""}
        actions={
          <button 
            onClick={() => setShowErrorDialog(false)}
            className="btn btn-primary"
          >
            Labi
          </button>
        }
      />
    </div>
  );
}
