import { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { generateDynamicMetadata } from '@/components/SEO/DynamicMetadata';

export async function generateMetadata({ params }: {
  params: {
    category: string;
    subjectId: string;
    lessonId: string;
  }
}): Promise<Metadata> {
  // Extract params values to avoid Next.js dynamic API warnings
  const category = params.category;
  const subjectId = params.subjectId;
  const lessonId = params.lessonId;
  
  // Create Supabase client
  const supabase = await createServerClient();
  
  // Fetch lesson details
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, teacher:teacher_id(full_name), subject:subject_id(*)')
    .eq('id', lessonId)
    .single();
    
  if (!lesson) {
    return {
      title: 'Nodarbība nav atrasta | MāciesTe',
      description: 'Meklētā nodarbība nav atrasta mūsu platformā.',
    };
  }
  
  // Fetch subject details to get category name
  const { data: subject } = await supabase
    .from('subjects')
    .select('*, category:category_id(name)')
    .eq('id', lesson.subject_id)
    .single();
    
  // Create canonical URL
  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://macies.te'}/${category}/${subjectId}/${lessonId}`;
  
  return {
    title: `${lesson.title} - ${subject?.name || 'Nodarbība'} | MāciesTe`,
    description: lesson.description || 'Rezervē šo nodarbību ar kvalificētu pasniedzēju',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${lesson.title} - ${subject?.name || 'Nodarbība'}`,
      description: lesson.description || 'Rezervē šo nodarbību ar kvalificētu pasniedzēju',
      url: canonicalUrl,
      siteName: 'MāciesTe',
      locale: 'lv_LV',
      type: 'article',
    },
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: lesson.title,
        description: lesson.description,
        provider: {
          '@type': 'Organization',
          name: 'MāciesTe',
          url: process.env.NEXT_PUBLIC_APP_URL || 'https://macies.te'
        }
      })
    }
  };
}