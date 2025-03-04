import { Booking } from '@/features/bookings/types';
import { User } from '@/features/auth/types/types';

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
  booking?: Booking;
  student?: User;
  teacher?: User;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
} 