// import { User } from '@/features/auth/types';

export * from './common';

export interface Metadata {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface BaseEntity extends Metadata {
  id: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
} 