"use client";
import { useState } from 'react';

interface TimeSlot {
  date: string;
  start: string;
  end: string;
}

interface TimeSlotPickerProps {
  availableSlots: TimeSlot[];
  onSelect: (slot: TimeSlot | null) => void;
  selectedSlot: TimeSlot | null;
  disabled?: boolean;
}

export default function TimeSlotPicker({ availableSlots, onSelect, selectedSlot, disabled = false }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Group slots by date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  // Get unique dates
  const dates = Object.keys(slotsByDate).sort();

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
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
          {slotsByDate[selectedDate].map((slot, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(slot)}
              className={`btn btn-sm ${
                selectedSlot === slot ? 'btn-primary' : 'btn-outline'
              }`}
            >
              {new Date(`${slot.date}T${slot.start}`).toLocaleTimeString('lv-LV', {
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