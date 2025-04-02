'use client';

import { useState, useEffect } from 'react';
import { Check, GraduationCap, BookOpen } from 'lucide-react';

/**
 * Role selection component - First step in onboarding
 * Allows users to choose between student and teacher roles
 */
interface RoleSelectionFormProps {
  onSelect: (role: 'student' | 'teacher') => void;
  isLoading: boolean;
  initialRole: 'student' | 'teacher' | null;
}

export function RoleSelectionForm({ onSelect, isLoading, initialRole }: RoleSelectionFormProps) {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(initialRole);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setSelectedRole(initialRole);
  }, [initialRole]);

  useEffect(() => {
    // Add animation after component loads
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    setSelectedRole(role);
    onSelect(role);
  };

  return (
    <div className="space-y-6">
      <p className="text-lg text-center">Kas jūs esat?</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Student Role Card */}
        <div
          className={`card bg-base-100 hover:shadow-lg cursor-pointer transition-all 
            ${selectedRole === 'student' ? 'ring-2 ring-accent shadow-lg' : 'shadow-md hover:shadow-accent/20'} 
            ${animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          style={{ transitionDelay: '100ms', transitionProperty: 'all', transitionDuration: '300ms' }}
          onClick={() => !isLoading && handleRoleSelect('student')}
        >
          <div className="absolute top-4 right-4">
            {selectedRole === 'student' && (
              <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          
          <div className="card-body">
            <div className="mb-4 w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            
            <h2 className="card-title">Skolēns</h2>
            <p className="text-base-content/70">
              Vēlos atrast pasniedzējus privātmācībām
            </p>
          </div>
        </div>

        {/* Teacher Role Card */}
        <div
          className={`card bg-base-100 hover:shadow-lg cursor-pointer transition-all 
            ${selectedRole === 'teacher' ? 'ring-2 ring-secondary shadow-lg' : 'shadow-md hover:shadow-secondary/20'} 
            ${animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          style={{ transitionDelay: '200ms', transitionProperty: 'all', transitionDuration: '300ms' }}
          onClick={() => !isLoading && handleRoleSelect('teacher')}
        >
          <div className="absolute top-4 right-4">
            {selectedRole === 'teacher' && (
              <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          
          <div className="card-body">
            <div className="mb-4 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-secondary" />
            </div>
            
            <h2 className="card-title">Pasniedzējs</h2>
            <p className="text-base-content/70">
              Vēlos piedāvāt privātmācības
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 