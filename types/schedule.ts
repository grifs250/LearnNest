import { Lesson } from './lesson';

export interface Schedule {
  id: string;
  lesson_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  lesson?: Lesson;
} 