'use client';

import { Subject as BaseSubject, Category } from '@/types/database';
import SubjectCategory from '@/features/shared/components/SubjectCategory';
import { useEffect, useState } from 'react';

// Extend the base Subject type to include UI properties
interface SubjectWithCategory extends Omit<BaseSubject, 'category_id'> {
  category?: Category;
  category_id?: string;
  lesson_count?: number;
  has_lessons?: boolean;
}

interface SubjectsSectionProps {
  subjects: SubjectWithCategory[];
}

interface CategoryGroup {
  category: Category;
  subjects: SubjectWithCategory[];
}

/**
 * Displays all subject categories with their subjects
 * Used on the landing page to show what subjects are available
 */
export default function SubjectsSection({ subjects }: SubjectsSectionProps) {
  const [groupedByCategory, setGroupedByCategory] = useState<CategoryGroup[]>([]);
  // Use separate loading state to prevent hydration mismatch
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    // Set client ready to true on mount to ensure hydration consistency
    setIsClientReady(true);
    
    if (!subjects || subjects.length === 0) {
      console.log('No subjects provided to SubjectsSection');
      setGroupedByCategory([]);
      return;
    }

    // Group subjects by category
    const groupedSubjects: Record<string, CategoryGroup> = {};
    
    // First collect all unique categories
    const categories = new Map<string, Category>();
    
    subjects.forEach(subject => {
      if (subject.category) {
        categories.set(subject.category.id, subject.category);
      }
    });

    // Initialize groups for all categories
    categories.forEach(category => {
      groupedSubjects[category.id] = {
        category,
        subjects: []
      };
    });
    
    // Then assign subjects to their respective categories
    subjects.forEach(subject => {
      if (subject.category) {
        const categoryId = subject.category.id;
        if (groupedSubjects[categoryId]) {
          groupedSubjects[categoryId].subjects.push(subject);
        }
      }
    });
    
    // Convert record to array and sort by category name
    const sortedCategories = Object.values(groupedSubjects)
      .filter(group => group.subjects.length > 0) // Only include categories with subjects
      .sort((a, b) => {
        // Sort by display_order if available, otherwise by name
        if (a.category.display_order && b.category.display_order) {
          return a.category.display_order - b.category.display_order;
        }
        return a.category.name.localeCompare(b.category.name);
      });
    
    setGroupedByCategory(sortedCategories);
  }, [subjects]);

  // Show loading state on server and during hydration
  // Use a static loading skeleton to prevent hydration mismatch
  if (!isClientReady) {
    return (
      <section className="py-16 bg-base-200">
        <div className="container px-6 mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">Mācību Priekšmeti</h2>
          <div className="space-y-16">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-6">
                <div className="h-6 bg-base-300 rounded w-1/4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="h-48 bg-base-300 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Handle the case when there are no categories or subjects
  if (groupedByCategory.length === 0) {
    return (
      <section className="py-16 bg-base-200">
        <div className="container px-6 mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">Mācību Priekšmeti</h2>
          <p className="text-center text-base-content/70 text-lg">
            Pagaidām nav pieejami mācību priekšmeti. Lūdzu, apmeklējiet mūs vēlāk.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="subjects" className="py-16 bg-base-200">
      <div className="container px-6 mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center">Mācību Priekšmeti</h2>
        
        {/* Category sections - without navigation */}
        <div className="space-y-16">
          {groupedByCategory.map(group => (
            <SubjectCategory 
              key={group.category.id}
              category={group.category}
              subjects={group.subjects}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 