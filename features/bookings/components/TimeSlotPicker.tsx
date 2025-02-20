"use client";
import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase/client";
import { collection, query, where, getDocs } from "firebase/firestore";
import { WorkHours, TimeRange } from '@/features/schedule/types';
import { BookedTimeData } from '@/features/bookings/types';

interface TimeSlotPickerProps {
  readonly workHours: WorkHours;
  readonly lessonLength: number;
  readonly onTimeSlotSelect: (timeSlot: string) => void;
  readonly selectedTimeSlot?: string;
  readonly mode?: 'booking' | 'schedule';
  readonly bookedTimes?: Record<string, BookedTimeData | null>;
  readonly teacherId: string;
}

function checkTimeSlotOverlap(
  startTime: Date,
  endTime: Date,
  bookedStart: Date,
  bookedEnd: Date
): boolean {
  return (
    (startTime >= bookedStart && startTime < bookedEnd) ||
    (endTime > bookedStart && endTime <= bookedEnd) ||
    (startTime <= bookedStart && endTime >= bookedEnd)
  );
}

async function fetchAllTeacherBookings(teacherId: string): Promise<Record<string, number>> {
  const lessonsQuery = query(
    collection(db, "lessons"),
    where("teacherId", "==", teacherId)
  );
  const lessonsSnap = await getDocs(lessonsQuery);
  
  const allBookings: Record<string, number> = {};
  lessonsSnap.docs.forEach(doc => {
    const lessonData = doc.data();
    if (lessonData.bookedTimes) {
      Object.entries(lessonData.bookedTimes).forEach(([timeSlot, booking]) => {
        if (booking && typeof booking === 'object' && 'status' in booking && booking.status !== 'rejected') {
          allBookings[timeSlot] = lessonData.lessonLength || 60;
        }
      });
    }
  });
  
  return allBookings;
}

function generateAvailableDates(workHours: WorkHours): string[] {
  const dates: string[] = [];
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();
    
    // Only add dates that are today or in the future
    if (date >= today && 
        workHours[dayOfWeek]?.enabled && 
        workHours[dayOfWeek]?.timeSlots.length > 0) {
      // For today, only show if there are time slots still available today
      if (date.getDate() === now.getDate()) {
        const hasAvailableTimeToday = workHours[dayOfWeek].timeSlots.some(slot => {
          const slotTime = new Date(`${date.toISOString().split('T')[0]}T${slot.end}`);
          return slotTime > now;
        });
        if (hasAvailableTimeToday) {
          dates.push(date.toISOString().split('T')[0]);
        }
      } else {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
  }

  return dates;
}

function generateTimeSlots(
  selectedDate: string,
  dayWorkHours: TimeRange[],
  lessonLength: number,
  bookedTimes: Record<string, BookedTimeData | null>,
  allTeacherBookings: Record<string, number>
): string[] {
  const slots: string[] = [];
  const now = new Date();

  dayWorkHours.forEach(({ start, end }) => {
    const startTime = new Date(`${selectedDate}T${start}`);
    const endTime = new Date(`${selectedDate}T${end}`);

    while (startTime.getTime() + lessonLength * 60000 <= endTime.getTime()) {
      const timeSlot = `${selectedDate}T${startTime.toTimeString().slice(0, 5)}`;
      const endOfThisSlot = new Date(startTime.getTime() + lessonLength * 60000);
      
      const isAvailable = isTimeSlotAvailable(
        startTime,
        endOfThisSlot,
        timeSlot,
        bookedTimes,
        allTeacherBookings,
        lessonLength
      );

      if (startTime > now && isAvailable) {
        slots.push(timeSlot);
      }

      startTime.setMinutes(startTime.getMinutes() + 15);
    }
  });

  return slots;
}

function isTimeSlotAvailable(
  startTime: Date,
  endTime: Date,
  timeSlot: string,
  bookedTimes: Record<string, BookedTimeData | null>,
  allTeacherBookings: Record<string, number>,
  lessonLength: number
): boolean {
  // Check current lesson's booked times
  for (const [bookedSlot, booking] of Object.entries(bookedTimes ?? {})) {
    if (booking && typeof booking === 'object' && 'status' in booking && booking.status !== 'rejected') {
      const bookedStart = new Date(bookedSlot);
      const bookedEnd = new Date(bookedStart.getTime() + lessonLength * 60000);
      if (checkTimeSlotOverlap(startTime, endTime, bookedStart, bookedEnd)) {
        return false;
      }
    }
  }

  // Check all teacher's other bookings
  for (const [bookedSlot, bookedLessonLength] of Object.entries(allTeacherBookings)) {
    const bookedStart = new Date(bookedSlot);
    const bookedEnd = new Date(bookedStart.getTime() + bookedLessonLength * 60000);
    if (checkTimeSlotOverlap(startTime, endTime, bookedStart, bookedEnd)) {
      return false;
    }
  }

  return true;
}

export function TimeSlotPicker({ 
  workHours, 
  lessonLength, 
  onTimeSlotSelect, 
  selectedTimeSlot,
  mode = 'booking',
  bookedTimes = {} as Record<string, BookedTimeData | null>,
  teacherId
}: Readonly<TimeSlotPickerProps>) {
  console.log('TimeSlotPicker workHours:', workHours);
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [allTeacherBookings, setAllTeacherBookings] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teacherId) return;
    
    fetchAllTeacherBookings(teacherId)
      .then(setAllTeacherBookings)
      .catch(error => {
        console.error("Error fetching teacher bookings:", error);
        setError("Failed to load teacher's schedule");
      });
  }, [teacherId]);

  useEffect(() => {
    if (!selectedDate || !workHours) return;

    const dayOfWeek = new Date(selectedDate).getDay();
    const daySchedule = workHours[dayOfWeek];
    
    if (daySchedule?.enabled) {
      const slots = generateTimeSlots(
        selectedDate,
        daySchedule.timeSlots,
        lessonLength,
        bookedTimes ?? {},
        allTeacherBookings
      );
      setAvailableTimeSlots(slots);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, workHours, lessonLength, bookedTimes, allTeacherBookings]);

  const dates = generateAvailableDates(workHours);

  return (
    <div className="space-y-4">
      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {dates.length > 0 ? (
          dates.map(date => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`btn btn-sm ${selectedDate === date ? 'btn-primary' : 'btn-ghost'}`}
            >
              {new Date(date).toLocaleDateString('lv-LV', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </button>
          ))
        ) : (
          <div className="alert alert-warning">
            Nav pieejamu datumu
          </div>
        )}
      </div>

      {selectedDate && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {availableTimeSlots.map((timeSlot) => (
            <button
              key={timeSlot}
              onClick={() => onTimeSlotSelect(timeSlot)}
              className={`btn btn-sm ${selectedTimeSlot === timeSlot ? 'btn-primary' : 'btn-outline'}`}
            >
              {new Date(timeSlot).toLocaleTimeString('lv-LV', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 