import { DbBooking } from '@/features/bookings/types';
import type { Database } from '@/types/supabase.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface Review {
  id: string;
  booking_id: string;
  student_id: string;
  teacher_id: string;
  rating: number;
  comment: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  booking?: DbBooking;
  student?: Profile;
  teacher?: Profile;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
} 