import { z } from 'zod';

// Common validation schemas
const emailSchema = z
  .string()
  .email('Please enter a valid email')
  .min(1, 'Email is required');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

// Sign in validation schema
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Sign up validation schema
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['student', 'teacher'] as const),
});

// Password reset validation schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

// Password update validation schema
export const updatePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
}).refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  }
);

// Export types
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>; 