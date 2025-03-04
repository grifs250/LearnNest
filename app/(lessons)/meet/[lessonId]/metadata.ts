import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { generateDynamicMetadata } from '@/components/SEO/DynamicMetadata';

export async function generateMetadata({ params }: {
  params: { lessonId: string }
}): Promise<Metadata> {
  const { lessonId } = params;
  const supabase = await createClient();
  
  // Fetch lesson details
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, teacher:teacher_id(full_name)')
    .eq('id', lessonId)
    .single();
    
  if (!lesson) {
    return {
      title: 'Nodarbība nav atrasta | MāciesTe',
      description: 'Meklētā nodarbība nav atrasta mūsu platformā.',
    };
  }
    
  return generateDynamicMetadata({
    title: `${lesson.title} - Tiešsaistes nodarbība | MāciesTe`,
    description: `Tiešsaistes nodarbība "${lesson.title}" ar ${lesson.teacher?.full_name || 'pasniedzēju'} platformā MāciesTe.`,
    pathname: `/lessons/meet/${lessonId}`,
    type: 'website',
  });
} 