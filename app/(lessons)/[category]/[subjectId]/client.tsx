'use client';

import { Subject } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';

interface Lesson {
  id: string;
  title: string;
  price: number;
  duration: number;
  description?: string | null;
  teacher?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  } | null;
}

interface SubjectDetailProps {
  subject: Subject;
  lessons: Lesson[];
}

export default function SubjectDetail({ subject, lessons }: SubjectDetailProps) {
  const [showAllLessons, setShowAllLessons] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  
  // Filter lessons based on search and price
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = 
      !searchQuery || 
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lesson.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPrice = 
      lesson.price >= priceRange[0] && 
      lesson.price <= priceRange[1];
    
    return matchesSearch && matchesPrice;
  });
  
  // Show only the first 6 lessons by default
  const displayedLessons = showAllLessons 
    ? filteredLessons 
    : filteredLessons.slice(0, 6);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Subject header */}
      <div className="bg-base-200 rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">{subject.name}</h1>
        {subject.description && (
          <p className="text-base-content/80 mb-4">{subject.description}</p>
        )}
        <div className="flex items-center">
          <div className="badge badge-primary">{lessons.length} nodarbības</div>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="mb-8 bg-base-100 p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="form-control flex-1">
            <div className="input-group">
              <input 
                type="text" 
                placeholder="Meklēt nodarbības..." 
                className="input input-bordered w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-square">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="form-control w-full md:w-48">
            <select 
              className="select select-bordered w-full"
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'all') {
                  setPriceRange([0, 1000]);
                } else if (value === 'low') {
                  setPriceRange([0, 20]);
                } else if (value === 'medium') {
                  setPriceRange([20, 50]);
                } else if (value === 'high') {
                  setPriceRange([50, 1000]);
                }
              }}
            >
              <option value="all">Visas cenas</option>
              <option value="low">Līdz €20</option>
              <option value="medium">€20 - €50</option>
              <option value="high">Virs €50</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Lessons grid */}
      <h2 className="text-2xl font-semibold mb-6">Pieejamās Nodarbības</h2>
      
      {filteredLessons.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-lg">
          <p className="text-xl">Nav atrasta neviena nodarbība.</p>
          <p className="mt-2 text-base-content/70">Mēģiniet mainīt meklēšanas kritērijus.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {displayedLessons.map((lesson) => (
              <div key={lesson.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-base-300">
                <div className="card-body p-5">
                  <h3 className="card-title text-lg">{lesson.title}</h3>
                  
                  {lesson.description && (
                    <p className="text-sm text-base-content/70 line-clamp-2">{lesson.description}</p>
                  )}
                  
                  {/* Teacher info */}
                  {lesson.teacher && (
                    <div className="flex items-center mt-2">
                      <div className="avatar">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                          {lesson.teacher.full_name.charAt(0)}
                        </div>
                      </div>
                      <span className="ml-2 text-sm">{lesson.teacher.full_name}</span>
                    </div>
                  )}
                  
                  {/* Price and duration */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-primary font-semibold">
                      €{lesson.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-base-content/70">
                      {lesson.duration} min
                    </div>
                  </div>
                  
                  <div className="card-actions justify-end mt-4">
                    <Link 
                      href={`/lessons/${lesson.id}`} 
                      className="btn btn-primary btn-sm"
                    >
                      Skatīt nodarbību
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Show more/less button */}
          {filteredLessons.length > 6 && (
            <div className="text-center mt-8">
              <button 
                className="btn btn-outline"
                onClick={() => setShowAllLessons(!showAllLessons)}
              >
                {showAllLessons ? 'Rādīt mazāk' : `Rādīt visas ${filteredLessons.length} nodarbības`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 