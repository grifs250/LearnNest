import { createBrowserClient } from '@supabase/ssr';
import { Subject } from '@/lib/types';
import type { Database } from '@/lib/types';

const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export const subjectClientService = {
  async getAllSubjects(): Promise<Subject[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        category:categories(*)
      `);

    if (error) {
      console.error('Error fetching all subjects:', error);
      return [];
    }

    return data as Subject[];
  },

  async getSubjectById(id: string): Promise<Subject | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching subject by ID:', error);
      return null;
    }

    return data as Subject;
  }
}; 