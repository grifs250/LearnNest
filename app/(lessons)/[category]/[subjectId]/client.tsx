"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Subject, LessonWithProfile } from '@/types/database';

interface SubjectClientProps {
  subject: Subject;
  lessons: LessonWithProfile[];
}

export function SubjectClient({ subject, lessons }: SubjectClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  
  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    // Filter by search query
    const matchesSearch = 
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lesson.description && lesson.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by price
    const matchesPrice = 
      lesson.price >= priceRange[0] && lesson.price <= priceRange[1];
    
    return matchesSearch && matchesPrice;
  });
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{subject.name}</h1>
        {subject.description && (
          <p className="text-gray-600">{subject.description}</p>
        )}
      </div>
      
      {/* Search and filters */}
      <div className="bg-base-200 p-4 rounded-lg mb-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Meklēt nodarbības</span>
              </div>
              <input 
                type="text" 
                placeholder="Meklēt..." 
                className="input input-bordered w-full" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
          </div>
          
          <div>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Cena (€{priceRange[0]} - €{priceRange[1]})</span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="range range-xs range-primary" 
                />
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="range range-xs range-primary" 
                />
              </div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Lessons list */}
      {filteredLessons.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map((lesson) => (
            <div key={lesson.id} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">{lesson.title}</h2>
                {lesson.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{lesson.description}</p>
                )}
                <div className="flex items-center mb-4">
                  <div className="avatar mr-2">
                    <div className="w-8 rounded-full">
                      <img src={lesson.teacher.avatar_url || '/profile-placeholder.png'} alt={lesson.teacher.full_name || 'Teacher'} />
                    </div>
                  </div>
                  <span className="text-sm font-medium">{lesson.teacher.full_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">€{lesson.price}</span>
                  <Link 
                    href={`/lessons/${subject.category_id}/${subject.id}/${lesson.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Apskatīt
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Nav atrasts neviens rezultāts</p>
        </div>
      )}
    </div>
  );
}