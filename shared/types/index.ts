export * from './models';

// Add any additional type exports here that are not model-related
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type ValidationError = {
  field: string;
  message: string;
};

export type ApiError = {
  code: string;
  message: string;
  errors?: ValidationError[];
}; 