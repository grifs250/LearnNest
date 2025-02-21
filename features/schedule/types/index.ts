export interface TimeRange {
  start: string; // Format: "HH:mm"
  end: string;   // Format: "HH:mm"
}

export interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeRange[];
}

// WorkHours is an array of DaySchedule, indexed by day of week (0-6)
export type WorkHours = DaySchedule[]; 