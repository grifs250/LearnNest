// Common utility types
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;

// Common response types
export interface ApiResponse<T = any> {
  data: T | null;
  error: Error | null;
}

// Common status types
export type Status = 'idle' | 'loading' | 'success' | 'error';

// Common date types
export type ISODateString = string; // Format: "2024-02-21T15:30:00Z"
export type TimeZone = string; // Format: "America/New_York"

// Common UI types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// Common metadata types
export interface Metadata {
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy?: string;
  updatedBy?: string;
}

// Common error types
export interface ApiError extends Error {
  code?: string;
  status?: number;
  data?: any;
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

// Common validation types
export interface ValidationError {
  field: string;
  message: string;
} 