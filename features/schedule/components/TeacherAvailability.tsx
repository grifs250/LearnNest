"use client";

import { useState } from "react";
import { useTeacherAvailability, DayTimeRange } from "../hooks/useTeacherAvailability";
import { toast } from "react-hot-toast";

// Day names in Latvian
export const DAY_NAMES = [
  "Svētdiena", // Sunday (0)
  "Pirmdiena", // Monday (1)
  "Otrdiena",  // Tuesday (2)
  "Trešdiena", // Wednesday (3)
  "Ceturtdiena", // Thursday (4)
  "Piektdiena", // Friday (5)
  "Sestdiena"  // Saturday (6)
];

interface TeacherAvailabilityProps {
  teacherId?: string;
}

export function TeacherAvailability({ teacherId }: TeacherAvailabilityProps) {
  const { formattedAvailability, loading, updateAvailability } = useTeacherAvailability();
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [timeRanges, setTimeRanges] = useState<DayTimeRange[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);

  const handleEditDay = (dayId: number) => {
    setEditingDay(dayId);
    setTimeRanges(formattedAvailability[dayId]?.timeRanges || [{ start: '09:00', end: '17:00' }]);
    setIsEnabled(formattedAvailability[dayId]?.enabled || false);
  };

  const handleAddTimeRange = () => {
    setTimeRanges([...timeRanges, { start: '09:00', end: '17:00' }]);
  };

  const handleRemoveTimeRange = (index: number) => {
    setTimeRanges(timeRanges.filter((_, i) => i !== index));
  };

  const handleTimeRangeChange = (index: number, field: 'start' | 'end', value: string) => {
    const newRanges = [...timeRanges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    setTimeRanges(newRanges);
  };

  const handleSaveDay = async () => {
    if (editingDay === null) return;
    
    // Validate time ranges
    for (const range of timeRanges) {
      if (range.start >= range.end) {
        toast.error('Sākuma laikam jābūt pirms beigu laika');
        return;
      }
    }
    
    await updateAvailability(editingDay, timeRanges, isEnabled);
    setEditingDay(null);
  };

  const handleCancelEdit = () => {
    setEditingDay(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Pieejamības laiki</h2>
      
      <div className="grid gap-4">
        {DAY_NAMES.map((dayName, dayId) => (
          <div key={dayId} className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{dayName}</h3>
                
                {editingDay === dayId ? (
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer label">
                      <span className="label-text mr-2">Pieejams</span>
                      <input 
                        type="checkbox" 
                        className="toggle toggle-primary" 
                        checked={isEnabled}
                        onChange={(e) => setIsEnabled(e.target.checked)}
                      />
                    </label>
                  </div>
                ) : (
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEditDay(dayId)}
                  >
                    Labot
                  </button>
                )}
              </div>
              
              {editingDay === dayId ? (
                <div className="space-y-4 mt-2">
                  {isEnabled && (
                    <>
                      {timeRanges.map((range, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="time"
                            className="input input-bordered w-32"
                            value={range.start}
                            onChange={(e) => handleTimeRangeChange(index, 'start', e.target.value)}
                          />
                          <span>—</span>
                          <input
                            type="time"
                            className="input input-bordered w-32"
                            value={range.end}
                            onChange={(e) => handleTimeRangeChange(index, 'end', e.target.value)}
                          />
                          
                          {timeRanges.length > 1 && (
                            <button 
                              className="btn btn-sm btn-ghost text-error"
                              onClick={() => handleRemoveTimeRange(index)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={handleAddTimeRange}
                      >
                        + Pievienot laiku
                      </button>
                    </>
                  )}
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <button 
                      className="btn btn-sm btn-ghost"
                      onClick={handleCancelEdit}
                    >
                      Atcelt
                    </button>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={handleSaveDay}
                    >
                      Saglabāt
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  {formattedAvailability[dayId]?.enabled ? (
                    <div className="space-y-1">
                      {formattedAvailability[dayId]?.timeRanges.map((range, index) => (
                        <div key={index} className="badge badge-outline gap-1 mr-2">
                          {range.start} — {range.end}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Nav pieejams</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 