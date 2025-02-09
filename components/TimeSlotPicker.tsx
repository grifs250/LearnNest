"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { format, parseISO, isBefore, addDays } from "date-fns";
import { lv } from "date-fns/locale";
import { TimeSlot } from "@/types/lesson";

interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeSlot[];
}

interface WeekSchedule {
  [key: string]: DaySchedule;
}

interface TimeSlotPickerProps {
  readonly teacherId: string;
  readonly onTimeSelected: (date: string, time: string) => void;
  readonly excludedTimes?: {
    [timeSlot: string]: {
      studentId: string;
      status: 'pending' | 'accepted' | 'rejected';
    };
  };
  readonly availableSlots?: TimeSlot[];
  readonly selectedSlot?: TimeSlot | null;
  readonly onSelect?: (slot: TimeSlot | null) => void;
  readonly disabled?: boolean;
}

export default function TimeSlotPicker({ teacherId, onTimeSelected, excludedTimes = {}, availableSlots, selectedSlot, onSelect, disabled }: TimeSlotPickerProps) {
  const [schedule, setSchedule] = useState<WeekSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const docRef = doc(db, "workSchedules", teacherId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setSchedule(docSnap.data() as WeekSchedule);
        } else {
          setError("Šobrīd nav pieejamu laiku");
        }
      } catch (err) {
        console.error("Error loading schedule:", err);
        setError("Neizdevās ielādēt pieejamos laikus");
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [teacherId]);

  const getAvailableDays = () => {
    if (!schedule) return [];

    const days = [];
    const today = new Date();
    const maxDate = addDays(today, 30); // Show next 30 days

    for (let date = today; isBefore(date, maxDate); date = addDays(date, 1)) {
      const dayName = format(date, 'EEEE', { locale: lv }).toLowerCase();
      const dateStr = format(date, 'yyyy-MM-dd');

      if (schedule[dayName]?.enabled && schedule[dayName]?.timeSlots.length > 0) {
        days.push({
          date: dateStr,
          dayName: format(date, 'EEEE, d MMMM', { locale: lv })
        });
      }
    }

    return days;
  };

  const getAvailableTimesForDate = (date: string) => {
    if (!schedule) return [];

    const dayName = format(parseISO(date), 'EEEE', { locale: lv }).toLowerCase();
    const daySchedule = schedule[dayName];

    if (!daySchedule?.enabled) return [];

    return daySchedule.timeSlots
      .map(slot => ({
        time: slot.start,
        isBooked: !!excludedTimes[`${date}T${slot.start}`]
      }))
      .filter(slot => !slot.isBooked);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning">
        <span>{error}</span>
      </div>
    );
  }

  const availableDays = getAvailableDays();

  if (availableDays.length === 0) {
    return (
      <div className="alert alert-info">
        <span>Šobrīd nav pieejamu laiku</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {availableDays.map(({ date, dayName }) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`btn ${selectedDate === date ? 'btn-primary' : 'btn-outline'}`}
          >
            {dayName}
          </button>
        ))}
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Pieejamie laiki:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {getAvailableTimesForDate(selectedDate).map(({ time }) => (
              <button
                key={time}
                onClick={() => onTimeSelected(selectedDate, time)}
                className="btn btn-outline"
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 