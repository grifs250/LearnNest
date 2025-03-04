import { Metadata } from 'next';
import { dbService } from '@/lib/supabase/db';

type Props = {
  params: {
    category: string;
    subjectId: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const subject = await dbService.getSubject(params.subjectId);
    
    if (!subject) {
      return {
        title: 'Priekšmets nav atrasts | MāciesTe',
        description: 'Diemžēl meklētais priekšmets nav atrasts.',
      };
    }
    
    return {
      title: `${subject.name} nodarbības | MāciesTe`,
      description: subject.description || 
        `Atklāj labākās ${subject.name} nodarbības platformā MāciesTe. Mācies no profesionāliem pasniedzējiem tiešsaistē.`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Nodarbības | MāciesTe',
      description: 'Atklāj labākās nodarbības platformā MāciesTe.',
    };
  }
} 