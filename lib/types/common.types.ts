// Common type definitions used across the application

// Base types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Database enums
export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

// Using string union type to enable string literal compatibility
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  PAYMENT = 'payment',
  REFUND = 'refund'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Base entity interface
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// User profile metadata
export interface Metadata {
  role?: UserRole;
  profile_completed?: boolean;
  profile_completed_at?: string;
  [key: string]: Json | undefined;
}

// User settings
export interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  [key: string]: Json | undefined;
}

// Form data types
export interface BaseFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
}

export interface StudentFormData extends BaseFormData {
  grade?: number;
  subjects?: string[];
  learningGoals?: string;
}

export interface TeacherFormData extends BaseFormData {
  subjects: string[];
  experience: number;
  education: string;
  bio: string;
  hourlyRate: number;
  availability: {
    [key: string]: {
      start: string;
      end: string;
    }[];
  };
}

// Common utility types
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;

// Common status types
export type Status = 'idle' | 'loading' | 'success' | 'error';

// Common date types
export type ISODateString = string; // Format: "2024-02-21T15:30:00Z"
export type TimeZone = string; // Format: "America/New_York"

// API response types (merged)
export interface ApiResponse<T = any> {
  data: T | null;
  error: Error | null;
  message?: string;
  code?: string;
  details?: Json;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Json;
}

// Pagination types (merged)
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Sort params
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// Search types
export interface SearchParams {
  query: string;
  filters?: Record<string, Json>;
  pagination?: PaginationParams;
}

// Date range type
export interface DateRange {
  start: string;
  end: string;
}

// File upload type
export interface FileUpload {
  file: File;
  type: string;
  size: number;
  name: string;
}

// Validation error type (merged)
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  touched?: boolean;
}

// Toast notification types
export interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description: string;
  duration?: number;
}

// Common function types
export type AsyncFunction<T = void> = (...args: any[]) => Promise<T>;
export type VoidFunction = () => void;

// Common component props
export interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
}

// Common form types
export interface FormField<T = string> {
  name: string;
  label: string;
  value: T;
  error?: string;
  touched?: boolean;
  required?: boolean;
  disabled?: boolean;
} 