import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function LessonsPage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('is_active', true);

  return (
    <div>
      {/* Your JSX here */}
    </div>
  );
} 