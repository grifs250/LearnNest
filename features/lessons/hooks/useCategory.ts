"use client";

import { useState, useEffect } from "react";
import { Category } from "../types";
import { supabase } from '@/lib/supabase/db';

export function useCategory(categoryId: string) {
  const [data, setData] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategory() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', categoryId)
          .single();

        if (error) throw error;
        setData(data);
      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Failed to load category");
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  return { data, loading, error };
}

export async function getCategoryById(categoryId: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
} 