"use client";

import { useState, useEffect } from "react";
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import { Category, Subject } from '@/types/database';
import { toast } from 'react-hot-toast';
import dbService from '@/lib/supabase/db';

// Define a more specific interface for API response
export interface CategoryWithSubjects extends Category {
  subjects: Subject[];
}

interface UseCategoryResult {
  data: CategoryWithSubjects | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for fetching a category with its subjects
 */
export function useCategory(categoryId: string): UseCategoryResult {
  const [data, setData] = useState<CategoryWithSubjects | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const categoryData = await dbService.getCategoryWithSubjects(categoryId);
      
      if (!categoryData) {
        throw new Error('Category not found');
      }
      
      setData(categoryData);
    } catch (err) {
      console.error('Error fetching category:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch category'));
      toast.error('Neizdevās ielādēt kategoriju');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchCategory
  };
}

export async function getCategoryById(categoryId: string): Promise<Category | null> {
  try {
    // Using the available getCategories method and filtering
    const categories = await dbService.getCategories();
    const category = categories.find(cat => cat.id === categoryId) || null;
    return category;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
} 