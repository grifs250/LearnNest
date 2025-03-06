'use client';

import { Subject, Category } from '@/types/models';
import SubjectCategory from '@/features/shared/components/SubjectCategory';
import { useEffect, useState } from 'react';

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
 * Updated for better theme compatibility and loading states
 */
export default function SubjectsSection({ subjects }: SubjectsSectionProps) {
  const [subjectGroups, setSubjectGroups] = useState<CategoryGroup[]>([]);
  const [isClientReady, setIsClientReady] = useState(false);
  
  // Process subjects to group by category after component mounts
  // This ensures it doesn't block theme/button initialization
  useEffect(() => {
    // Group subjects by category
    const groupedSubjects = subjects.reduce((acc, subject) => {
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
    
    // Convert to array for rendering
    setSubjectGroups(Object.values(groupedSubjects));
    setIsClientReady(true);
  }, [subjects]);

  return (
    <section className="py-12 bg-base-200" id="subjects" aria-labelledby="subjects-title">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 id="subjects-title" className="text-3xl font-bold">Mācību Priekšmeti</h2>
          <p className="text-base-content/70 mt-2">Izvēlies sev piemērotu priekšmetu</p>
        </div>
        
        {/* Container for better mobile display */}
        <div className="container mx-auto px-4">
          {/* Show categories and subjects only when client-side processing is complete */}
          {isClientReady ? (
            <>
              {/* Categories and Subjects Sections */}
              {subjectGroups.map((group) => (
                <SubjectCategory 
                  key={group.category.id}
                  category={group.category}
                  subjects={group.subjects}
                />
              ))}
              
              {/* Empty state if no subjects */}
              {subjectGroups.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4 opacity-50" aria-hidden="true">📚</div>
                  <h3 className="text-xl font-semibold">Drīzumā būs pieejami mācību priekšmeti</h3>
                  <p className="mt-2 text-base-content/70">Mēs strādājam, lai pievienotu vairāk mācību priekšmetu.</p>
                </div>
              )}
            </>
          ) : (
            /* Skeleton loading state - shows while groups are being processed */
            <div className="animate-pulse">
              {[...Array(2)].map((_, categoryIndex) => (
                <section 
                  key={categoryIndex}
                  className="py-8 border-t border-base-300 mt-4 first:mt-0 first:border-t-0"
                >
                  <div className="h-8 bg-base-300 rounded w-48 mb-6"></div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, subjectIndex) => (
                      <div 
                        key={subjectIndex}
                        className="card bg-base-200 shadow-sm h-48 border border-base-300"
                      >
                        <div className="card-body p-5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="h-6 bg-base-300 rounded w-24"></div>
                            <div className="h-4 bg-base-300 rounded w-16"></div>
                          </div>
                          <div className="mt-2 h-10 bg-base-300 rounded"></div>
                          <div className="mt-3 flex justify-between items-center">
                            <div className="h-4 bg-base-300 rounded w-20"></div>
                            <div className="h-4 bg-base-300 rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 