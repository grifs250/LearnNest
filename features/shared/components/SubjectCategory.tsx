'use client';

import { Category, Subject as BaseSubject } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Extended Subject type with additional properties needed for UI
interface SubjectWithMeta extends Omit<BaseSubject, 'category_id'> {
  category_id?: string;
  lesson_count?: number;
  metadata?: any;
  has_lessons?: boolean;
  category?: Category;
}

interface SubjectCategoryProps {
  category: Category;
  subjects: SubjectWithMeta[];
}

/**
 * Component for displaying a category of subjects
 * Used on the landing page to display subjects grouped by category
 * Supports smooth scrolling via ID-based anchors
 */
export default function SubjectCategory({ category, subjects }: SubjectCategoryProps) {
  const [processedSubjects, setProcessedSubjects] = useState<SubjectWithMeta[]>([]);
  // Use a client-ready state instead of loading to avoid hydration issues
  const [isClientReady, setIsClientReady] = useState(false);
  
  useEffect(() => {
    // Mark as client-ready immediately to avoid hydration mismatch
    setIsClientReady(true);
    
    // Process subjects to ensure consistent rendering
    const enhanced = subjects.map(subject => {
      // Try to get lesson count from direct property or default to 0
      const lessonCount = subject.lesson_count ?? 0;
      
      // Return enhanced subject with lesson_count set properly
      return {
        ...subject,
        lesson_count: lessonCount
      };
    });
    
    setProcessedSubjects(enhanced);
  }, [subjects]);

  // Function to check if lessons are actually available in the database
  const getLessonAvailability = (subject: SubjectWithMeta) => {
    // First check has_lessons flag if it exists
    if (subject.has_lessons !== undefined) {
      if (!subject.has_lessons) {
        return {
          status: 'unavailable',
          label: 'Nav nodarbību',
          badgeClass: 'badge-ghost text-xs',
          count: 0
        };
      } else {
        return {
          status: 'available',
          label: 'Pieejams', 
          badgeClass: 'badge-success text-xs',
          count: subject.lesson_count || 0
        };
      }
    }
    
    // Fall back to checking lesson count if has_lessons flag is not available
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

  // Show placeholder during SSR and initial client-side rendering
  // Using a static (non-animated) skeleton to avoid hydration issues
  if (!isClientReady) {
    return (
      <section 
        className="py-8 border-t border-base-300 mt-4 first:mt-0 first:border-t-0"
      >
        <h3 className="text-2xl font-bold mb-6">{category.name}</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="card bg-base-200 shadow-sm border border-base-300">
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
    );
  }

  return (
    <section 
      className="py-8 border-t border-base-300 mt-4 first:mt-0 first:border-t-0"
    >
      <h3 className="text-2xl font-bold mb-6">{category.name}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {processedSubjects.map((subject) => {
          const availability = getLessonAvailability(subject);
          
          // Card styles based on availability
          const cardClasses = availability.status === 'unavailable'
            ? "card bg-base-100 shadow-sm opacity-70 cursor-not-allowed transition-all border border-base-300"
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
                      Skatīt
                    </span>
                  </>
                ) : (
                  <div className="flex items-center text-sm text-base-content/70">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Drīzumā būs pieejams</span>
                  </div>
                )}
              </div>
            </div>
          );
          
          // If there are no lessons, render a non-clickable div
          if (availability.status === 'unavailable') {
            return (
              <div 
                key={subject.id}
                className={cardClasses}
              >
                {cardContent}
              </div>
            );
          }
          
          // Otherwise render a clickable link
          const href = subject.category 
            ? `/${subject.category.name.toLowerCase()}/${subject.id}`
            : `/subjects/${subject.id}`;
            
          return (
            <Link 
              key={subject.id} 
              href={href}
              className={cardClasses}
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