import { z } from "zod";
import { LESSON_LENGTH_OPTIONS } from "../constants";

// Extract the values from LESSON_LENGTH_OPTIONS for the type
type LessonLength = typeof LESSON_LENGTH_OPTIONS[number];

export const lessonSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  lessonLength: z.enum(['30', '45', '60', '90', '120']).transform(val => parseInt(val, 10)),
  price: z.number().min(0, "Price must be positive"),
  category: z.string(),
  subjectId: z.string()
});

export type LessonFormData = z.infer<typeof lessonSchema>; 