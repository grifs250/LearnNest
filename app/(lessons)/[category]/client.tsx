'use client';

import { Category, Subject } from '@/lib/types';
import Link from 'next/link';

interface CategoryDetailProps {
  category: Category;
  subjects: Subject[];
  subjectsWithLessons: Map<string, boolean>;
}

/**
 * Client component for displaying category details and subjects
 */
export default function CategoryDetail({ 
  category, 
  subjects, 
  subjectsWithLessons 
}: CategoryDetailProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-base-content/70">{category.description}</p>
        )}
      </header>

      {subjects.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-base-content/70">
            Šajā kategorijā nav pieejamu priekšmetu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {subjects.map((subject) => {
            const hasLessons = subjectsWithLessons.get(subject.id) || false;
            
            return hasLessons ? (
              <Link 
                key={subject.id} 
                href={`/${category.name.toLowerCase()}/${subject.id}`}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="card-body p-6">
                  <h2 className="card-title">{subject.name}</h2>
                  {subject.description && (
                    <p className="text-sm text-base-content/70 line-clamp-2">
                      {subject.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center text-success">
                    <span className="mr-2">✓</span>
                    <span>Pieejamas nodarbības</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div 
                key={subject.id} 
                className="card bg-base-200 shadow-md cursor-not-allowed"
              >
                <div className="card-body p-6">
                  <h2 className="card-title text-base-content/70">{subject.name}</h2>
                  {subject.description && (
                    <p className="text-sm text-base-content/50 line-clamp-2">
                      {subject.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center text-base-content/50">
                    <span className="mr-2">ℹ️</span>
                    <span>Nav pieejamu nodarbību</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 