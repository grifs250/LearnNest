import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { generateDynamicMetadata } from '@/components/SEO/DynamicMetadata';

export async function generateMetadata({ params }: {
  params: { category: string }
}): Promise<Metadata> {
  const { category } = params;
  const supabase = await createClient();
  
  // Fetch category details
  const { data: categoryData } = await supabase
    .from('categories')
    .select('name, description')
    .eq('id', category)
    .single();
    
  if (!categoryData) {
    return {
      title: 'Kategorija nav atrasta | MāciesTe',
      description: 'Meklētā kategorija nav atrasta mūsu platformā.',
    };
  }
    
  return generateDynamicMetadata({
    title: `${categoryData.name} - Priekšmeti | MāciesTe`,
    description: categoryData.description || 
      `Izpēti MāciesTe piedāvātās ${categoryData.name} nodarbības un atrodi sev piemērotu pasniedzēju.`,
    pathname: `/lessons/${category}`,
    type: 'website',
  });
} 