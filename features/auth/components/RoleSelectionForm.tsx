'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Loader2, GraduationCap, Book, Check } from 'lucide-react';

/**
 * Role selection form - First step in onboarding
 * Allows users to choose between student and teacher roles
 */
interface RoleSelectionFormProps {
  onSelect: (role: 'student' | 'teacher') => void;
  isLoading: boolean;
  initialRole: 'student' | 'teacher' | null;
}

export function RoleSelectionForm({ onSelect, isLoading, initialRole }: RoleSelectionFormProps) {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(initialRole);

  useEffect(() => {
    setSelectedRole(initialRole);
  }, [initialRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole) {
      onSelect(selectedRole);
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Role Card */}
        <div
          className={`card bg-base-100 shadow-xl cursor-pointer transition-all ${
            selectedRole === 'student' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedRole('student')}
        >
          <div className="card-body">
            <h2 className="card-title">Skolēns</h2>
            <p className="text-base-content/70">
              Esmu skolēns un vēlos atrast pasniedzējus privātmācībām
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Atrodi piemērotus pasniedzējus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Plāno mācību laiku</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Seko savam progresam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Role Card */}
        <div
          className={`card bg-base-100 shadow-xl cursor-pointer transition-all ${
            selectedRole === 'teacher' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedRole('teacher')}
        >
          <div className="card-body">
            <h2 className="card-title">Pasniedzējs</h2>
            <p className="text-base-content/70">
              Esmu pasniedzējs un vēlos piedāvāt privātmācības
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Piedāvā savas pakalpojumus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Pārvaldi mācību grafiku</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Seko studentu progresam</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!selectedRole || isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm mr-2"></span>
              Saglabā...
            </>
          ) : (
            'Turpināt'
          )}
        </button>
      </div>
    </form>
  );
} 