"use client";

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const SignUpButtons = () => {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<'student' | 'teacher' | null>(null);

  const handleRedirect = (role: 'student' | 'teacher') => {
    setLoadingRole(role);
    // Use a shorter delay to minimize waiting time but still show loading state
    setTimeout(() => {
      router.push(`/register?role=${role}`);
    }, 50);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-4xl mx-auto gap-4 md:gap-6 px-4">
      <div className="w-full">
        <button 
          onClick={() => handleRedirect('student')}
          disabled={loadingRole !== null}
          className="btn btn-accent btn-lg w-full h-auto px-6 py-4 shadow-md hover:shadow-xl transition-all rounded-xl flex items-center justify-between hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center">
            <span className="text-2xl mr-3">👨‍🎓</span>
            <span className="font-medium text-lg">Reģistrēties kā students</span>
          </div>
          {loadingRole === 'student' ? (
            <span className="loading loading-spinner loading-md"></span>
          ) : (
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          )}
        </button>
      </div>
      
      <div className="w-full">
        <button 
          onClick={() => handleRedirect('teacher')}
          disabled={loadingRole !== null}
          className="btn btn-secondary btn-lg w-full h-auto px-6 py-4 shadow-md hover:shadow-xl transition-all rounded-xl flex items-center justify-between hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center">
            <span className="text-2xl mr-3">👨‍🏫</span>
            <span className="font-medium text-lg">Reģistrēties kā pasniedzējs</span>
          </div>
          {loadingRole === 'teacher' ? (
            <span className="loading loading-spinner loading-md"></span>
          ) : (
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          )}
        </button>
      </div>
    </div>
  );
}; 