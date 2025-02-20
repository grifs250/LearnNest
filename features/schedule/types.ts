/** Represents a time range with start and end times */
export interface TimeRange {
  start: string;
  end: string;
}

/** Work hours configuration for each day of the week */
export interface WorkHours {
  [key: number]: {
    enabled: boolean;
    timeSlots: TimeRange[];
  };
}

export interface TeacherWorkHoursProps {
  readonly teacherId: string;
}

export const DAYS = [
  { id: 0, name: 'Svētdiena' },
  { id: 1, name: 'Pirmdiena' },
  { id: 2, name: 'Otrdiena' },
  { id: 3, name: 'Trešdiena' },
  { id: 4, name: 'Ceturtdiena' },
  { id: 5, name: 'Piektdiena' },
  { id: 6, name: 'Sestdiena' }
] as const;

export interface WorkScheduleProps {
  readonly initialWorkHours?: WorkHours;
}

export interface TimeSlotRowProps {
  readonly slot: TimeRange;
  readonly dayId: number;
  readonly index: number;
  readonly canDelete: boolean;
  readonly onTimeChange: (dayId: number, index: number, field: keyof TimeRange, value: string) => void;
  readonly onRemove: (dayId: number, index: number) => void;
}

export interface ScheduleHelpers {
  getNextFourWeeksDates: (dayId: string) => string[];
  saveSchedule: (schedule: WorkHours, userId: string) => Promise<void>;
} 