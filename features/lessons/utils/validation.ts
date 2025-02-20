import { z } from "zod";
import { LESSON_LENGTH_OPTIONS } from "../constants";

export const lessonSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  lessonLength: z.number().refine(val => LESSON_LENGTH_OPTIONS.includes(val)),
  price: z.number().min(0, "Price must be positive"),
  category: z.string(),
  subjectId: z.string()
});

export type LessonFormData = z.infer<typeof lessonSchema>; 