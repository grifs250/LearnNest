'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@/lib/types/database.types';
import { ChevronRight, Loader2, GraduationCap, Book, Check } from 'lucide-react';

/**
 * Role selection form - First step in onboarding
 * Allows users to choose between student and teacher roles
 */
export function RoleSelectionForm({ 
  onSubmit, 
  isLoading,
  initialRole = null
}: { 
  onSubmit: (role: UserRole) => void; 
  isLoading: boolean;
  initialRole?: UserRole | null;
}) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(initialRole);

  // Update selected role if initialRole changes
  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole) {
      onSubmit(selectedRole);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo and Platform Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
          <GraduationCap className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">MāciesTe</h1>
        <p className="text-base-content/70 mt-2">Privātstundu platforma, kas savieno skolēnus un pasniedzējus</p>
      </div>
      
      <h2 className="text-2xl font-bold text-center">Izvēlieties savu lomu</h2>
      <p className="text-base-content/70 mb-6 text-center">
        Lai labāk pielāgotu platformu jūsu vajadzībām, lūdzu norādiet, kā plānojat izmantot MāciesTe.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {/* Student Role Option */}
        <div 
          className={`
            cursor-pointer border rounded-lg p-6 text-center 
            transition-all duration-200 hover:shadow-md
            ${selectedRole === 'student' 
              ? 'border-primary bg-primary/10 ring-2 ring-primary' 
              : 'border-base-300 hover:border-primary/50'}
          `}
          onClick={() => setSelectedRole('student')}
        >
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/20 p-3">
              <Book className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Skolēns</h3>
          <p className="text-base-content/70">
            Es vēlos atrast pasniedzējus un pierakstīties uz nodarbībām
          </p>
        </div>
        
        {/* Teacher Role Option */}
        <div 
          className={`
            cursor-pointer border rounded-lg p-6 text-center 
            transition-all duration-200 hover:shadow-md
            ${selectedRole === 'teacher' 
              ? 'border-secondary bg-secondary/10 ring-2 ring-secondary' 
              : 'border-base-300 hover:border-secondary/50'}
          `}
          onClick={() => setSelectedRole('teacher')}
        >
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-secondary/20 p-3">
              <GraduationCap className="w-10 h-10 text-secondary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Pasniedzējs</h3>
          <p className="text-base-content/70">
            Es vēlos piedāvāt savas zināšanas un rīkot nodarbības
          </p>
        </div>
      </div>
      
      <button 
        type="submit" 
        className="btn btn-primary w-full mt-8"
        disabled={isLoading || !selectedRole}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={20} />
            <span>Apstrādā...</span>
          </>
        ) : (
          <>
            <span>Turpināt</span>
            <ChevronRight size={18} />
          </>
        )}
      </button>
    </form>
  );
} 