"use client";

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

/**
 * SignUpButtons component for the landing page
 * Uses Link components for instant navigation without waiting for JS
 */
export const SignUpButtons = () => {
  const [hoverRole, setHoverRole] = useState<'student' | 'teacher' | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-4xl mx-auto gap-4 md:gap-6 px-4">
      <div className="w-full">
        <Link 
          href="/register?role=student"
          className="btn btn-accent btn-lg w-full h-auto px-6 py-4 shadow-md hover:shadow-xl transition-all rounded-xl flex items-center justify-between hover:scale-[1.02] active:scale-[0.98]"
          onMouseEnter={() => setHoverRole('student')}
          onMouseLeave={() => setHoverRole(null)}
        >
          <div className="flex items-center">
            <span className="text-2xl mr-3">👨‍🎓</span>
            <span className="font-medium text-lg">Reģistrēties kā students</span>
          </div>
          <ArrowRight size={20} className={`ml-2 transition-transform ${hoverRole === 'student' ? 'translate-x-1' : ''}`} />
        </Link>
      </div>
      
      <div className="w-full">
        <Link 
          href="/register?role=teacher"
          className="btn btn-secondary btn-lg w-full h-auto px-6 py-4 shadow-md hover:shadow-xl transition-all rounded-xl flex items-center justify-between hover:scale-[1.02] active:scale-[0.98]"
          onMouseEnter={() => setHoverRole('teacher')}
          onMouseLeave={() => setHoverRole(null)}
        >
          <div className="flex items-center">
            <span className="text-2xl mr-3">👨‍🏫</span>
            <span className="font-medium text-lg">Reģistrēties kā pasniedzējs</span>
          </div>
          <ArrowRight size={20} className={`ml-2 transition-transform ${hoverRole === 'teacher' ? 'translate-x-1' : ''}`} />
        </Link>
      </div>
    </div>
  );
}; 