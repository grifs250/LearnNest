import { Schedule } from './schedule';

export interface Booking {
  id: string;
  schedule_id: string;
  student_id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  schedule?: Schedule;
  review?: {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
  };
} 