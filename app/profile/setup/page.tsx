"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/lib/types/database.types';
import { toast } from 'react-hot-toast';

// Student setup form
function StudentSetupForm({ onSubmit, isLoading }: { 
  onSubmit: (data: any) => void; 
  isLoading: boolean 
}) {
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [goal, setGoal] = useState('');
  const [age, setAge] = useState<number | undefined>();
  const [languages, setLanguages] = useState<string[]>([]);
  const [language, setLanguage] = useState('');

  const handleAddGoal = () => {
    if (goal.trim() && !learningGoals.includes(goal.trim())) {
      setLearningGoals([...learningGoals, goal.trim()]);
      setGoal('');
    }
  };

  const handleAddLanguage = () => {
    if (language.trim() && !languages.includes(language.trim())) {
      setLanguages([...languages, language.trim()]);
      setLanguage('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      learning_goals: learningGoals,
      age,
      languages
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold">Skolēna profila izveide</h2>
      <p className="text-sm text-gray-600 mb-4">Lūdzu, aizpildiet šo informāciju, lai varētu sākt izmantot platformu.</p>
      
      {/* Age */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Vecums</span>
        </label>
        <input
          type="number"
          className="input input-bordered"
          value={age || ''}
          onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>
      
      {/* Learning Goals */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Mācību mērķi</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Piem., Uzlabot angļu valodu"
          />
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleAddGoal}
          >
            Pievienot
          </button>
        </div>
        {learningGoals.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {learningGoals.map((g, i) => (
              <div key={i} className="badge badge-primary badge-outline p-3">
                {g}
                <button 
                  type="button" 
                  className="ml-2" 
                  onClick={() => setLearningGoals(learningGoals.filter((_, idx) => idx !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Languages */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Valodas, kurās runājat</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Piem., Latviešu"
          />
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleAddLanguage}
          >
            Pievienot
          </button>
        </div>
        {languages.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {languages.map((lang, i) => (
              <div key={i} className="badge badge-primary badge-outline p-3">
                {lang}
                <button 
                  type="button" 
                  className="ml-2" 
                  onClick={() => setLanguages(languages.filter((_, idx) => idx !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button 
        type="submit" 
        className="btn btn-accent w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Apstrādā...' : 'Pabeigt reģistrāciju'}
      </button>
    </form>
  );
}

// Teacher setup form
function TeacherSetupForm({ onSubmit, isLoading }: { 
  onSubmit: (data: any) => void; 
  isLoading: boolean 
}) {
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | undefined>();
  const [education, setEducation] = useState<string[]>([]);
  const [educationItem, setEducationItem] = useState('');
  const [taxId, setTaxId] = useState('');
  const [personalId, setPersonalId] = useState('');

  const handleAddEducation = () => {
    if (educationItem.trim() && !education.includes(educationItem.trim())) {
      setEducation([...education, educationItem.trim()]);
      setEducationItem('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      bio,
      hourly_rate: hourlyRate,
      education,
      tax_id: taxId,
      personal_id: personalId
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold">Pasniedzēja profila izveide</h2>
      <p className="text-sm text-gray-600 mb-4">Lūdzu, aizpildiet šo informāciju, lai varētu sākt izmantot platformu.</p>
      
      {/* Bio */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Apraksts par sevi</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-24"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Pastāstiet par savu pieredzi un specialitāti"
        />
      </div>
      
      {/* Hourly Rate */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Stundas likme (€)</span>
        </label>
        <input
          type="number"
          step="0.01"
          className="input input-bordered"
          value={hourlyRate || ''}
          onChange={(e) => setHourlyRate(e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>
      
      {/* Education */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Izglītība</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={educationItem}
            onChange={(e) => setEducationItem(e.target.value)}
            placeholder="Piem., Bakalaura grāds matemātikā"
          />
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleAddEducation}
          >
            Pievienot
          </button>
        </div>
        {education.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {education.map((edu, i) => (
              <div key={i} className="badge badge-primary badge-outline p-3">
                {edu}
                <button 
                  type="button" 
                  className="ml-2" 
                  onClick={() => setEducation(education.filter((_, idx) => idx !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Tax ID */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Nodokļu maksātāja Nr.</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
        />
      </div>
      
      {/* Personal ID */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Personas kods</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          value={personalId}
          onChange={(e) => setPersonalId(e.target.value)}
        />
      </div>
      
      <button 
        type="submit" 
        className="btn btn-secondary w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Apstrādā...' : 'Pabeigt reģistrāciju'}
      </button>
    </form>
  );
}

export default function ProfileSetupPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { userId } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userLoaded) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Get the user's role from metadata
    const userRole = user.publicMetadata.role as UserRole || 'student';
    setRole(userRole);
    setLoading(false);
  }, [user, userLoaded, router]);

  const handleProfileSubmit = async (data: any) => {
    if (!user || !role) return;
    
    setSubmitting(true);
    
    try {
      const supabase = createClient();
      
      // Check if user already has a profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Kļūda profila meklēšanā: ${fetchError.message}`);
      }

      // If profile exists, update it, otherwise create it
      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role,
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProfile.id);

        if (updateError) {
          throw new Error(`Kļūda profila atjaunināšanā: ${updateError.message}`);
        }
      } else {
        // Create a new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            email: user.primaryEmailAddress?.emailAddress,
            full_name: user.fullName || 'User',
            role,
            is_active: true,
            ...data,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          throw new Error(`Kļūda profila izveidē: ${insertError.message}`);
        }
      }

      toast.success('Profils veiksmīgi saglabāts!');
      router.push('/profile');
    } catch (error) {
      console.error('Profile setup error:', error);
      toast.error((error as Error).message || 'Kļūda profila saglabāšanā');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-base-100 rounded-lg shadow-lg p-6">
        {role === 'teacher' ? (
          <TeacherSetupForm onSubmit={handleProfileSubmit} isLoading={submitting} />
        ) : (
          <StudentSetupForm onSubmit={handleProfileSubmit} isLoading={submitting} />
        )}
      </div>
    </div>
  );
} 