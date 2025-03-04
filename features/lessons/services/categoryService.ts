import { createServerSupabaseClient } from '@/lib/supabase/client';
import type { Category } from '../types';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        subjects(*)
      `);

    if (error) throw error;
    return data as Category[];
  },

  async getCategory(id: string): Promise<Category> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        subjects(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Category;
  }
}; 