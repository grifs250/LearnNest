'use client';

import { Subject, Category } from '@/types/models';
import SubjectCategory from '@/features/shared/components/SubjectCategory';

interface SubjectsSectionProps {
  subjects: Subject[];
}

interface CategoryGroup {
  category: Category;
  subjects: Subject[];
}

/**
 * Subjects section of the landing page
 * Displays subjects grouped by category with availability information
 * SEO-optimized with semantic HTML, proper headings hierarchy,
 * and reuses the existing SubjectCategory component for consistency
 * Updated for better theme compatibility
 */
export default function SubjectsSection({ subjects }: SubjectsSectionProps) {
  // Group subjects by category
  const subjectsByCategory = subjects.reduce((acc, subject) => {
    if (!subject.category) return acc;
    
    const categoryId = subject.category.id;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: subject.category,
        subjects: []
      };
    }
    acc[categoryId].subjects.push(subject);
    return acc;
  }, {} as Record<string, CategoryGroup>);

  return (
    <section className="py-12 bg-base-200" id="subjects" aria-labelledby="subjects-title">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 id="subjects-title" className="text-3xl font-bold">Mācību Priekšmeti</h2>
          <p className="text-base-content/70 mt-2">Izvēlies sev piemērotu priekšmetu</p>
        </div>
        
        {/* Container for better mobile display */}
        <div className="container mx-auto px-4">
          {/* Categories and Subjects Sections */}
          {Object.values(subjectsByCategory).map((group) => (
            <SubjectCategory 
              key={group.category.id}
              category={group.category}
              subjects={group.subjects}
            />
          ))}
          
          {/* Empty state if no subjects */}
          {Object.values(subjectsByCategory).length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 opacity-50" aria-hidden="true">📚</div>
              <h3 className="text-xl font-semibold">Drīzumā būs pieejami mācību priekšmeti</h3>
              <p className="mt-2 text-base-content/70">Mēs strādājam, lai pievienotu vairāk mācību priekšmetu.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 