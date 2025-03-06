'use client';

import { Category, Subject } from '@/types/models';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SubjectCategoryProps {
  category: Category;
  subjects: Subject[];
}

/**
 * Component for displaying a category of subjects
 * Used on the landing page to display subjects grouped by category
 * Supports smooth scrolling via ID-based anchors
 */
export default function SubjectCategory({ category, subjects }: SubjectCategoryProps) {
  const [processedSubjects, setProcessedSubjects] = useState<Subject[]>([]);
  
  // Process subjects once on mount to extract lesson_count from metadata if needed
  useEffect(() => {
    const enhanced = subjects.map(subject => {
      // Try to get lesson count from direct property
      let lessonCount = subject.lesson_count;
      
      // If not available and metadata exists, try to get from metadata
      if (lessonCount === undefined && subject.metadata) {
        try {
          // Need to typecast metadata to access properties safely
          const metadata = subject.metadata as Record<string, any>;
          if (metadata && typeof metadata === 'object' && 'lesson_count' in metadata) {
            const metadataCount = metadata.lesson_count;
            if (metadataCount !== undefined) {
              lessonCount = typeof metadataCount === 'string' 
                ? parseInt(metadataCount) 
                : metadataCount as number;
            }
          }
        } catch (error) {
          console.error('Error parsing metadata lesson count:', error);
        }
      }
      
      // Return enhanced subject with lesson_count set properly
      return {
        ...subject,
        lesson_count: lessonCount ?? 0
      };
    });
    
    setProcessedSubjects(enhanced);
  }, [subjects]);

  // Function to check if lessons are actually available in the database
  const getLessonAvailability = (subject: Subject) => {
    // Use the lesson_count property if available
    const lessonCount = subject.lesson_count ?? 0;
    
    const hasLessons = lessonCount > 0;
    
    if (!hasLessons) {
      return {
        status: 'unavailable',
        label: 'Nav nodarbību',
        badgeClass: 'badge-ghost text-xs',
        count: 0
      };
    }
    
    // We could have different statuses based on other criteria
    return {
      status: 'available',
      label: 'Pieejams', 
      badgeClass: 'badge-success text-xs',
      count: lessonCount
    };
  };

  // Debug function to log subject data
  const logSubjectData = (subject: Subject) => {
    console.log(`Subject ${subject.name}:`, {
      id: subject.id,
      lesson_count: subject.lesson_count,
      metadata: subject.metadata
    });
  };

  return (
    <section 
      id={`category-${category.id}`} 
      className="py-8 border-t border-base-300 mt-4 first:mt-0 first:border-t-0"
      data-category-name={category.name}
    >
      <h3 className="text-2xl font-bold mb-6">{category.name}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {processedSubjects.map((subject) => {
          const availability = getLessonAvailability(subject);
          
          // Card styles based on availability
          const cardClasses = availability.status === 'unavailable'
            ? "card bg-base-100 shadow-sm opacity-80 cursor-not-allowed transition-all border border-base-300"
            : "card bg-base-100 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border border-transparent hover:border-primary/20";
          
          // Create a card component with consistent structure regardless of availability
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
          
          // If there are no lessons, render a non-clickable div
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
        })}
      </div>
      
      {/* Note for future development */}
      {/* 
        To show exact lesson counts for each subject, we would need to:
        1. Fetch lesson data from the lessons table with counts per subject
        2. Join this data with the subjects query in the API
        3. Pass the counts to the frontend
        
        For a proper implementation, we should modify the fetchSubjects function to include:
        - The count of active lessons per subject
        - The count of available schedule slots
      */}
    </section>
  );
} 