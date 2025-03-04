import { Metadata } from 'next';
import { CategoryClient } from './client';
import dbService from '@/lib/supabase/db';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryId = params.category;
  
  try {
    const categoryData = await dbService.getCategoryWithSubjects(categoryId);
    
    if (!categoryData) {
      return {
        title: 'Kategorija nav atrasta | MāciesTe',
        description: 'Diemžēl meklētā kategorija nav atrasta.',
      };
    }
    
    return {
      title: `${categoryData.name} | MāciesTe`,
      description: categoryData.description || `Apgūsti ${categoryData.name} priekšmetus MāciesTe platformā!`,
    };
  } catch (error) {
    console.error('Error generating category metadata:', error);
    return {
      title: 'Kategorija | MāciesTe',
      description: 'Apgūsti priekšmetus MāciesTe platformā!',
    };
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categoryId = params.category;
  
  return <CategoryClient categoryId={categoryId} />;
}