import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'Rating is required')
    .max(5, 'Rating must be between 1 and 5'),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must not exceed 500 characters'),
  booking_id: z.string().uuid('Invalid booking ID'),
  student_id: z.string().uuid('Invalid student ID'),
  teacher_id: z.string().uuid('Invalid teacher ID'),
  is_public: z.boolean().default(true),
});

export type ReviewFormData = z.infer<typeof reviewSchema>; 