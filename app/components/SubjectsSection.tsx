'use client';

import { Subject, Category } from '@/types/models';
import Link from 'next/link';
import { useMemo } from 'react';

interface SubjectsSectionProps {
  subjects: Subject[];
}

interface CategoryGroup {
  category: Category;
  subjects: Subject[];
}

/**
 * Subjects section of the landing page
 * Optimized version that pre-processes data on the server 
 * and minimizes client-side state changes
 */
export default function SubjectsSection({ subjects }: SubjectsSectionProps) {
  // Use useMemo to compute this once instead of on every render
  const subjectsByCategory = useMemo(() => {
    return subjects.reduce((acc, subject) => {
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
  }, [subjects]);

  // Extract lesson count from subject data
  const getLessonCount = (subject: Subject): number => {
    // If lesson_count is directly available, use it
    if (typeof subject.lesson_count === 'number') {
      return subject.lesson_count;
    }
    
    // Otherwise try to get from metadata as fallback
    if (subject.metadata && typeof subject.metadata === 'object') {
      const metadata = subject.metadata as Record<string, any>;
      if ('lesson_count' in metadata) {
        const metadataCount = metadata.lesson_count;
        if (metadataCount !== undefined) {
          return typeof metadataCount === 'string' 
            ? parseInt(metadataCount) 
            : metadataCount as number;
        }
      }
    }
    
    return 0;
  };

  // Function to check if lessons are available
  const getLessonAvailability = (subject: Subject) => {
    const lessonCount = getLessonCount(subject);
    
    const hasLessons = lessonCount > 0;
    
    if (!hasLessons) {
      return {
        status: 'unavailable',
        label: 'Nav nodarbību',
        badgeClass: 'badge-ghost text-xs',
        count: 0
      };
    }
    
    // Return availability status
    return {
      status: 'available',
      label: 'Pieejams', 
      badgeClass: 'badge-success text-xs',
      count: lessonCount
    };
  };

  // Function to render a subject card
  const renderSubjectCard = (subject: Subject) => {
    const availability = getLessonAvailability(subject);
    
    // Card styles based on availability
    const cardClasses = availability.status === 'unavailable'
      ? "card bg-base-100 shadow-sm opacity-80 cursor-not-allowed transition-all border border-base-300"
      : "card bg-base-100 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border border-transparent hover:border-primary/20";
    
    // Card content is the same regardless of availability
    const cardContent = (
      <div className="card-body p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-lg line-clamp-1">{subject.name}</h3>
          
          <div className="flex flex-col items-end">
            <div className={`badge ${availability.badgeClass} whitespace-nowrap`}>
              {availability.label}
            </div>
          </div>
        </div>
        
        {subject.description && (
          <p className="text-sm text-base-content/70 line-clamp-2 mt-2 min-h-[2.5rem]">{subject.description}</p>
        )}
        
        {/* Footer with lesson count info */}
        <div className="mt-3 flex justify-between items-center">
          {availability.status === 'available' ? (
            <>
              <div className="flex items-center text-sm text-success font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="leading-none">{availability.count}</span>
                <span className="ml-1 leading-none">{availability.count > 1 ? 'nodarbības' : 'nodarbība'}</span>
              </div>
              
              <span className="badge badge-primary badge-outline text-xs">
                Rezervējiet
              </span>
            </>
          ) : null}
        </div>
      </div>
    );
    
    // If no lessons, render a non-clickable card
    if (availability.status === 'unavailable') {
      return (
        <div 
          key={subject.id}
          className={cardClasses}
          title="Šim priekšmetam nav pieejamas nodarbības"
        >
          {cardContent}
        </div>
      );
    }
    
    // Otherwise render a clickable link
    return (
      <Link 
        key={subject.id} 
        href={`/subjects/${subject.id}`} 
        className={cardClasses}
        title={`Aplūkot ${subject.name} nodarbības`}
      >
        {cardContent}
      </Link>
    );
  };

  return (
    <section className="py-12 bg-base-200" id="subjects">
        <h2 className="text-3xl font-bold text-center mb-10">Mācību Priekšmeti</h2>
        
        {/* Container for better mobile display */}
        <div className="container mx-auto px-4">
          {/* Categories and Subjects Sections */}
          {Object.values(subjectsByCategory).map((group) => (
            <section 
              key={group.category.id}
              id={`category-${group.category.id}`} 
              className="py-10 bg-base-200 border-t border-base-300"
              data-category-name={group.category.name}
            >
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-8">{group.category.name}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.subjects.map((subject) => renderSubjectCard(subject))}
                </div>
              </div>
            </section>
          ))}
          
          {/* Empty state if no subjects */}
          {Object.values(subjectsByCategory).length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 opacity-50">📚</div>
              <h3 className="text-xl font-semibold">Drīzumā būs pieejami mācību priekšmeti</h3>
              <p className="mt-2 text-base-content/70">Mēs strādājam, lai pievienotu vairāk mācību priekšmetu.</p>
            </div>
          )}
        </div>
    </section>
  );
} 