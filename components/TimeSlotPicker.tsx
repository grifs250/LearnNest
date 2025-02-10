"use client";
import { useState, useEffect } from 'react';
import { BookingStatus } from '@/types/lesson';

interface TimeSlot {
  timeSlot: string; // Format: "YYYY-MM-DDTHH:mm"
  status?: BookingStatus | null;
  studentName?: string;
  isAvailable?: boolean;
}

interface WorkHours {
  [date: string]: {
    start: string;
    end: string;
  }[];
}

interface TimeSlotPickerProps {
  readonly workHours: WorkHours;  // Make this required
  readonly lessonLength: number;  // Make this required
  readonly onTimeSlotSelect: (timeSlot: string) => void;
  readonly selectedTimeSlot?: string;
  readonly mode: 'booking' | 'viewing';
  readonly bookedTimes: {  // Make this required
    [timeSlot: string]: {
      studentId: string;
      studentName: string;
      status: BookingStatus;
    } | null;
  };
}

export default function TimeSlotPicker({ 
  workHours,
  lessonLength,
  onTimeSlotSelect, 
  selectedTimeSlot,
  mode = 'booking',
  bookedTimes
}: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Debug logs
  console.log('Received bookedTimes:', bookedTimes);
  console.log('Received workHours:', workHours);

  useEffect(() => {
    if (!workHours || Object.keys(workHours).length === 0) {
      console.log('No work hours available');
      return;
    }

    const now = new Date();
    const slots: TimeSlot[] = [];

    Object.entries(workHours).forEach(([date, timeRanges]) => {
      const currentDate = new Date(date);
      if (currentDate < now) return;

      timeRanges.forEach(({ start, end }) => {
        const startTime = new Date(`${date}T${start}`);
        const endTime = new Date(`${date}T${end}`);

        while (startTime < endTime) {
          if (startTime > now) {
            const timeSlot = startTime.toISOString().split('.')[0];
            const booking = bookedTimes[timeSlot];
            
            console.log(`Checking slot ${timeSlot}:`, booking);

            if (!booking || booking.status === 'rejected') {
              slots.push({
                timeSlot,
                isAvailable: true
              });
            }
          }
          startTime.setMinutes(startTime.getMinutes() + lessonLength);
        }
      });
    });

    console.log('Generated available slots:', slots);
    setAvailableSlots(slots);

    if (slots.length > 0 && !selectedDate) {
      const firstDate = slots[0].timeSlot.split('T')[0];
      setSelectedDate(firstDate);
    }
  }, [workHours, bookedTimes, lessonLength, selectedDate]);

  // Group slots by date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    const date = slot.timeSlot.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  // Get unique dates
  const dates = Object.keys(slotsByDate).sort((a, b) => a.localeCompare(b, 'lv'));

  // Add this before the return statement
  const getButtonClass = (isSelectable: boolean, timeSlot: string) => {
    if (selectedTimeSlot === timeSlot) return 'btn btn-sm btn-primary';
    if (isSelectable) return 'btn btn-sm btn-outline';
    return 'btn btn-sm btn-disabled';
  };

  const getBadgeClass = (status: BookingStatus) => {
    if (status === 'accepted') return 'badge badge-sm badge-success';
    if (status === 'rejected') return 'badge badge-sm badge-error';
    return 'badge badge-sm badge-warning';
  };

  return (
    <div className="space-y-4">
      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {dates.map(date => (
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
        ))}
      </div>

      {/* Time slots for selected date */}
      {selectedDate && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {slotsByDate[selectedDate].map((slot: TimeSlot) => {
            const isSelectable = mode === 'booking' ? (slot.isAvailable ?? true) : true;
            const buttonClass = getButtonClass(isSelectable, slot.timeSlot);

            return (
              <button
                key={slot.timeSlot}
                onClick={() => isSelectable && onTimeSlotSelect(slot.timeSlot)}
                className={buttonClass}
                disabled={!isSelectable}
                title={slot.studentName ? `Booked by ${slot.studentName}` : undefined}
              >
                {new Date(slot.timeSlot).toLocaleTimeString('lv-LV', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {slot.status && (
                  <span className={getBadgeClass(slot.status)}>
                    {slot.status}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
} 