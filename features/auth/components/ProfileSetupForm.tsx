'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/lib/types/database.types';
import { toast } from 'react-hot-toast';
import { Check, ChevronLeft, ChevronRight, Loader2, Plus, X } from 'lucide-react';
import { RoleSelectionForm } from './RoleSelectionForm';

// Common profile form for both roles - Step 2
function CommonProfileForm({ onSubmit, isLoading }: { 
  onSubmit: (data: any) => void; 
  isLoading: boolean 
}) {
  const { user } = useUser();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState<number | undefined>();
  const [phone, setPhone] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [language, setLanguage] = useState('');

  const handleAddLanguage = () => {
    if (language.trim() && !languages.includes(language.trim())) {
      setLanguages([...languages, language.trim()]);
      setLanguage('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      full_name: fullName,
      bio,
      age,
      phone,
      languages
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">Pamata informācija</h2>
      <p className="text-base-content/70 mb-6">Lūdzu, aizpildiet šo informāciju, lai varētu sākt izmantot platformu.</p>
      
      {/* Full Name */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Pilns vārds</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Vārds Uzvārds"
          required
        />
      </div>
      
      {/* Bio */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Par mani</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-24"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Pastāstiet par sevi"
        />
      </div>
      
      {/* Age */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Vecums</span>
        </label>
        <input
          type="number"
          className="input input-bordered w-full"
          value={age || ''}
          onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Jūsu vecums"
        />
      </div>
      
      {/* Phone */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Telefona numurs</span>
        </label>
        <input
          type="tel"
          className="input input-bordered w-full"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+371 XXXXXXXX"
        />
      </div>
      
      {/* Languages */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Valodas, kurās runājat</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Piem., Latviešu"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddLanguage();
              }
            }}
          />
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleAddLanguage}
          >
            <Plus size={18} />
          </button>
        </div>
        {languages.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {languages.map((lang, i) => (
              <div key={i} className="badge badge-primary badge-lg gap-1 p-3">
                <span>{lang}</span>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs btn-circle" 
                  onClick={() => setLanguages(languages.filter((_, idx) => idx !== i))}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button 
        type="submit" 
        className="btn btn-primary w-full mt-8"
        disabled={isLoading}
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

// Student-specific form - Step 2 for students
function StudentRoleForm({ onSubmit, isLoading }: { 
  onSubmit: (data: any) => void; 
  isLoading: boolean 
}) {
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [goal, setGoal] = useState('');

  const handleAddGoal = () => {
    if (goal.trim() && !learningGoals.includes(goal.trim())) {
      setLearningGoals([...learningGoals, goal.trim()]);
      setGoal('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      learning_goals: learningGoals
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">Skolēna profila izveide</h2>
      <p className="text-base-content/70 mb-6">Pastāstiet mums vairāk par jūsu mācību mērķiem.</p>
      
      {/* Learning Goals */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Mācību mērķi</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Piem., Uzlabot angļu valodu"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddGoal();
              }
            }}
          />
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleAddGoal}
          >
            <Plus size={18} />
          </button>
        </div>
        {learningGoals.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {learningGoals.map((g, i) => (
              <div key={i} className="badge badge-accent badge-lg gap-1 p-3">
                <span>{g}</span>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={() => setLearningGoals(learningGoals.filter((_, idx) => idx !== i))}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="label mt-2">
          <span className="label-text-alt">Jūsu mācību mērķi palīdzēs pasniedzējiem labāk saprast jūsu vajadzības.</span>
        </label>
      </div>
      
      <div className="flex gap-4 mt-8">
        <button 
          type="button" 
          className="btn btn-outline flex-1"
          onClick={() => onSubmit({ goBack: true })}
        >
          <ChevronLeft size={18} />
          <span>Atpakaļ</span>
        </button>
        
        <button 
          type="submit" 
          className="btn btn-accent flex-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              <span>Apstrādā...</span>
            </>
          ) : (
            <>
              <span>Pabeigt reģistrāciju</span>
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Teacher-specific form - Step 2 for teachers
function TeacherRoleForm({ onSubmit, isLoading }: { 
  onSubmit: (data: any) => void; 
  isLoading: boolean 
}) {
  const [hourlyRate, setHourlyRate] = useState<number | undefined>();
  const [education, setEducation] = useState<string[]>([]);
  const [educationItem, setEducationItem] = useState('');
  const [experience, setExperience] = useState<string[]>([]);
  const [experienceItem, setExperienceItem] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [specializationItem, setSpecializationItem] = useState('');

  const handleAddEducation = () => {
    if (educationItem.trim() && !education.includes(educationItem.trim())) {
      setEducation([...education, educationItem.trim()]);
      setEducationItem('');
    }
  };

  const handleAddExperience = () => {
    if (experienceItem.trim() && !experience.includes(experienceItem.trim())) {
      setExperience([...experience, experienceItem.trim()]);
      setExperienceItem('');
    }
  };

  const handleAddSpecialization = () => {
    if (specializationItem.trim() && !specializations.includes(specializationItem.trim())) {
      setSpecializations([...specializations, specializationItem.trim()]);
      setSpecializationItem('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      hourly_rate: hourlyRate,
      education,
      experience,
      specializations
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">Pasniedzēja profila izveide</h2>
      <p className="text-base-content/70 mb-6">Pastāstiet mums vairāk par jūsu profesionālo pieredzi.</p>
      
      {/* Hourly Rate */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Stundas likme (€)</span>
        </label>
        <input
          type="number"
          step="0.01"
          className="input input-bordered w-full"
          value={hourlyRate || ''}
          onChange={(e) => setHourlyRate(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="15.00"
          required
        />
        <label className="label">
          <span className="label-text-alt">Cik jūs ņemat par vienu mācību stundu (60 min).</span>
        </label>
      </div>
      
      {/* Education */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Izglītība</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={educationItem}
            onChange={(e) => setEducationItem(e.target.value)}
            placeholder="Piem., Bakalaura grāds matemātikā"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddEducation();
              }
            }}
          />
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleAddEducation}
          >
            <Plus size={18} />
          </button>
        </div>
        {education.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {education.map((edu, i) => (
              <div key={i} className="badge badge-secondary badge-lg gap-1 p-3">
                <span>{edu}</span>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs btn-circle" 
                  onClick={() => setEducation(education.filter((_, idx) => idx !== i))}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Experience */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Pieredze</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={experienceItem}
            onChange={(e) => setExperienceItem(e.target.value)}
            placeholder="Piem., 5 gadi skolā kā matemātikas skolotājs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddExperience();
              }
            }}
          />
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleAddExperience}
          >
            <Plus size={18} />
          </button>
        </div>
        {experience.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {experience.map((exp, i) => (
              <div key={i} className="badge badge-secondary badge-lg gap-1 p-3">
                <span>{exp}</span>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs btn-circle" 
                  onClick={() => setExperience(experience.filter((_, idx) => idx !== i))}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Specializations */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Specializācijas</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={specializationItem}
            onChange={(e) => setSpecializationItem(e.target.value)}
            placeholder="Piem., Algebriskās vienādojumu sistēmas"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSpecialization();
              }
            }}
          />
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleAddSpecialization}
          >
            <Plus size={18} />
          </button>
        </div>
        {specializations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {specializations.map((spec, i) => (
              <div key={i} className="badge badge-secondary badge-lg gap-1 p-3">
                <span>{spec}</span>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-xs btn-circle" 
                  onClick={() => setSpecializations(specializations.filter((_, idx) => idx !== i))}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex gap-4 mt-8">
        <button 
          type="button" 
          className="btn btn-outline flex-1"
          onClick={() => onSubmit({ goBack: true })}
        >
          <ChevronLeft size={18} />
          <span>Atpakaļ</span>
        </button>
        
        <button 
          type="submit" 
          className="btn btn-secondary flex-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              <span>Apstrādā...</span>
            </>
          ) : (
            <>
              <span>Pabeigt reģistrāciju</span>
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Progress steps for setup flow
function SetupSteps({ currentStep, totalSteps, role }: { 
  currentStep: number; 
  totalSteps: number;
  role: UserRole | null;
}) {
  return (
    <ul className="steps w-full mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <li 
          key={index} 
          className={`step ${index + 1 <= currentStep ? (index + 1 === currentStep ? 'step-primary' : 'step-success') : ''}`}
        >
          {index + 1 === 1 && 'Loma'}
          {index + 1 === 2 && 'Pamata informācija'}
          {index + 1 === 3 && (role === 'teacher' ? 'Pasniedzēja info' : 'Skolēna info')}
          {index + 1 === 4 && 'Pabeigts'}
        </li>
      ))}
    </ul>
  );
}

/**
 * Main profile setup form component
 * Handles both teacher and student profile setup with a multi-step approach
 */
export function ProfileSetupForm() {
  const { user, isLoaded: userLoaded } = useUser();
  const { userId } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState(1); // Start with role selection
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  
  useEffect(() => {
    if (!userLoaded) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user already has a role selected from Clerk metadata
    // Even if they have a role, we'll still show the role selection step
    // to give them a chance to change it
    const userRole = user.unsafeMetadata?.role as UserRole;
    if (userRole) {
      // Pre-select the role but stay on step 1
      setRole(userRole);
    }
    
    setLoading(false);
  }, [user, userLoaded, router]);

  // Handle role selection (step 1)
  const handleRoleSelection = async (selectedRole: UserRole) => {
    setSubmitting(true);
    
    try {
      // Store role in state and localStorage for backup
      setRole(selectedRole);
      localStorage.setItem('userRole', selectedRole);
      
      // Update Clerk metadata
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            role: selectedRole
          }
        });
      }
      
      // Move to next step
      setStep(2);
    } catch (error) {
      console.error('Role selection error:', error);
      toast.error('Kļūda lomas saglabāšanā');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle step 2 (common info) submission
  const handleCommonInfoSubmit = async (data: any) => {
    setProfileData({ ...profileData, ...data });
    setStep(3);
  };

  // Handle step 3 (role-specific info) submission
  const handleRoleInfoSubmit = async (data: any) => {
    // Check if user wants to go back
    if (data.goBack) {
      setStep(2);
      return;
    }
    
    // Combine all profile data
    const completeProfileData = { ...profileData, ...data };
    
    // Submit the complete profile
    await saveProfileToDatabase(completeProfileData);
  };

  // Final submission handler
  const saveProfileToDatabase = async (data: any) => {
    if (!user || !role || !userId) return;
    
    setSubmitting(true);
    
    try {
      const supabase = createClient();
      
      // Generate a URL slug from the full name
      const fullName = data.full_name || user.fullName || 'User';
      const urlSlug = fullName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .trim();
      
      console.log("User ID:", userId);
      console.log("Role:", role);
      console.log("Profile data:", data);
      
      // Build the profile payload
      const profilePayload = {
        user_id: userId,
        email: user.primaryEmailAddress?.emailAddress || '',
        full_name: data.full_name || user.fullName || 'User',
        role,
        bio: data.bio || null,
        phone: data.phone || null,
        is_active: true,
        hourly_rate: role === 'teacher' ? data.hourly_rate : null,
        learning_goals: role === 'student' ? data.learning_goals : null,
        age: data.age || null,
        languages: data.languages || null,
        metadata: {
          profile_slug: urlSlug,
          education: role === 'teacher' ? data.education : null,
          experience: role === 'teacher' ? data.experience : null,
          specializations: role === 'teacher' ? data.specializations : null,
          profile_completed: true,
          profile_needs_setup: false,
          profile_completion_date: new Date().toISOString()
        }
      };

      // First check if user already has a profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, metadata')
        .eq('user_id', userId)
        .single();

      console.log("Fetch result:", existingProfile, fetchError);

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Kļūda profila meklēšanā: ${fetchError.message}`);
      }

      // If profile exists, update it while preserving existing metadata
      if (existingProfile) {
        // Merge existing metadata with new metadata
        const mergedMetadata = {
          ...(existingProfile.metadata || {}),
          ...profilePayload.metadata
        };

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            ...profilePayload,
            metadata: mergedMetadata,
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
            ...profilePayload,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          throw new Error(`Kļūda profila izveidē: ${insertError.message}`);
        }
      }

      // Update Clerk user metadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role,
          profile_completed: true,
          profile_needs_setup: false
        }
      });

      toast.success('Profils veiksmīgi izveidots!');
      setStep(4); // Show success state
      
      // Redirect after a short delay
      setTimeout(() => {
        if (role === 'teacher') {
          router.push('/teacher');
        } else {
          router.push('/student');
        }
      }, 2000);
    } catch (error) {
      console.error('Profile setup error:', error);
      toast.error((error as Error).message || 'Kļūda profila saglabāšanā');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="card w-full max-w-2xl mx-auto bg-base-100 shadow-lg">
        <div className="card-body items-center p-8">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-lg">Ielādē profila informāciju...</p>
        </div>
      </div>
    );
  }

  // Success state (step 4)
  if (step === 4) {
    return (
      <div className="card w-full max-w-2xl mx-auto bg-base-100 shadow-lg">
        <div className="card-body p-8">
          <SetupSteps currentStep={4} totalSteps={4} role={role} />
          
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-success/20 p-4">
                <Check className="w-16 h-16 text-success" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">Profils veiksmīgi izveidots!</h2>
            <p className="text-base-content/70 mb-6">
              Paldies par reģistrāciju platformā MāciesTe! Jūs tiekat novirzīts uz {role === 'teacher' ? 'pasniedzēja' : 'skolēna'} paneli.
            </p>
            <div className="loading loading-dots loading-md mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Role selection
  if (step === 1) {
    return (
      <div className="card w-full max-w-2xl mx-auto bg-base-100 shadow-lg">
        <div className="card-body p-8">
          <SetupSteps currentStep={1} totalSteps={4} role={role} />
          
          <RoleSelectionForm 
            onSubmit={handleRoleSelection} 
            isLoading={submitting} 
            initialRole={role}
          />
        </div>
      </div>
    );
  }

  // Step 2: Basic common information
  if (step === 2) {
    return (
      <div className="card w-full max-w-2xl mx-auto bg-base-100 shadow-lg">
        <div className="card-body p-8">
          <SetupSteps currentStep={2} totalSteps={4} role={role} />
          
          <CommonProfileForm onSubmit={handleCommonInfoSubmit} isLoading={submitting} />
        </div>
      </div>
    );
  }

  // Step 3: Role-specific information
  return (
    <div className="card w-full max-w-2xl mx-auto bg-base-100 shadow-lg">
      <div className="card-body p-8">
        <SetupSteps currentStep={3} totalSteps={4} role={role} />
        
        {role === 'teacher' ? (
          <TeacherRoleForm onSubmit={handleRoleInfoSubmit} isLoading={submitting} />
        ) : (
          <StudentRoleForm onSubmit={handleRoleInfoSubmit} isLoading={submitting} />
        )}
      </div>
    </div>
  );
} 