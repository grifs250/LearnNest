"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { RoleSelectionForm } from "./RoleSelectionForm";
import { StudentRoleForm } from "./StudentRoleForm";
import { TeacherRoleForm } from "./TeacherRoleForm";
import { useToast } from "@/features/shared/hooks/useToast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";

export function ProfileSetupForm() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClientComponentClient<Database>();
  
  // State management
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    age: null as number | null,
    phone: "",
    languages: [] as string[],
    learning_goals: [] as string[],
    hourly_rate: null as number | null,
    education: [] as string[],
    experience: [] as string[],
    specializations: [] as string[]
  });

  // Load initial role from Clerk metadata
  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.unsafeMetadata?.role as 'student' | 'teacher' | null;
      if (userRole) {
        setRole(userRole);
      }
    }
  }, [isLoaded, user]);

  // Handle role selection
  const handleRoleSelect = async (selectedRole: 'student' | 'teacher') => {
    try {
      setIsLoading(true);
      
      // Update Clerk user metadata
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role: selectedRole
        }
      });
      
      // Update local state
      setRole(selectedRole);
      
      // Update Supabase profile
      const { error } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('user_id', user?.id);
        
      if (error) throw error;
      
      // Move to next step
    setStep(2);
      
      showToast({
        type: "success",
        title: "Loma izvēlēta",
        description: "Lūdzu, aizpildiet savu profilu"
      });
    } catch (error) {
      console.error("Error selecting role:", error);
      showToast({
        type: "error",
        title: "Kļūda",
        description: "Neizdevās saglabāt lomas izvēli"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Generate URL slug from name
      const slug = formData.full_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Build profile payload
      const profilePayload = {
        user_id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        full_name: formData.full_name,
        role: role || 'student',
        bio: formData.bio,
        phone: formData.phone,
        is_active: true,
        hourly_rate: formData.hourly_rate,
        learning_goals: formData.learning_goals,
        age: formData.age,
        languages: formData.languages,
        metadata: {
          profile_slug: slug,
          education: formData.education,
          experience: formData.experience,
          specializations: formData.specializations,
          profile_completed: true,
          profile_needs_setup: false,
          profile_completion_date: new Date().toISOString()
        }
      };

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, metadata')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        // Update existing profile while preserving metadata
        const { error } = await supabase
          .from('profiles')
          .update({
            ...profilePayload,
            metadata: {
              ...existingProfile.metadata,
              ...profilePayload.metadata
            }
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert([profilePayload]);

        if (error) throw error;
      }

      // Update Clerk user metadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role: role,
          profile_completed: true,
          profile_needs_setup: false
        }
      });
      
      showToast({
        type: "success",
        title: "Profils saglabāts",
        description: "Jūsu profils ir veiksmīgi saglabāts"
      });
      
      // Redirect based on role
        if (role === 'teacher') {
        router.push("/teacher");
        } else {
        router.push("/student");
        }
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast({
        type: "error",
        title: "Kļūda",
        description: "Neizdevās saglabāt profilu"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
        <div className="max-w-md w-full mx-auto text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <h2 className="text-xl font-bold">Ielādē profila informāciju</h2>
          <p className="text-base-content/70 mt-2">Lūdzu, uzgaidiet...</p>
        </div>
      </div>
    );
  }

  // Render form based on step
    return (
    <div className="min-h-screen bg-base-200 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-base-100 rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-center mb-2">Profila iestatīšana</h1>
            <p className="text-center text-base-content/70">
              {step === 1 && "Izvēlieties savu lomu platformā"}
              {step === 2 && "Aizpildiet pamatinformāciju"}
              {step === 3 && role === 'student' && "Nosakiet savus mācīšanās mērķus"}
              {step === 3 && role === 'teacher' && "Pievienojiet savu izglītību un pieredzi"}
              {step === 4 && "Pārskatiet un apstipriniet informāciju"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Role Selection */}
            <div className={`${step === 1 ? 'block' : 'hidden'}`}>
              <RoleSelectionForm 
                onSelect={handleRoleSelect} 
                isLoading={isLoading}
                initialRole={role}
              />
            </div>

            {/* Step 2: Basic Information */}
            <div className={`${step === 2 ? 'block' : 'hidden'}`}>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Vārds, uzvārds</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Biogrāfija</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Vecums</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Tālrunis</span>
                  </label>
                  <input
                    type="tel"
                    className="input input-bordered w-full"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Valodas</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.languages.join(', ')}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value.split(',').map(lang => lang.trim()) })}
                    placeholder="Latviešu, Angļu, Krievu"
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setStep(1)}
                  >
                    Atpakaļ
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setStep(3)}
                  >
                    Tālāk
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3: Role-Specific Information */}
            <div className={`${step === 3 ? 'block' : 'hidden'}`}>
              {role === 'student' ? (
                <StudentRoleForm
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => setStep(2)}
                  onNext={() => setStep(4)}
                />
              ) : (
                <TeacherRoleForm
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => setStep(2)}
                  onNext={() => setStep(4)}
                />
              )}
            </div>

            {/* Step 4: Review */}
            <div className={`${step === 4 ? 'block' : 'hidden'}`}>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pārskats</h3>
                
                <div className="space-y-2">
                  <p><strong>Loma:</strong> {role === 'student' ? 'Skolēns' : 'Skolotājs'}</p>
                  <p><strong>Vārds, uzvārds:</strong> {formData.full_name}</p>
                  <p><strong>Biogrāfija:</strong> {formData.bio}</p>
                  <p><strong>Vecums:</strong> {formData.age}</p>
                  <p><strong>Tālrunis:</strong> {formData.phone}</p>
                  <p><strong>Valodas:</strong> {formData.languages.join(', ')}</p>
                  
                  {role === 'student' ? (
                    <>
                      <p><strong>Mācīšanās mērķi:</strong></p>
                      <ul className="list-disc list-inside">
                        {formData.learning_goals.map((goal, index) => (
                          <li key={index}>{goal}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <p><strong>Stundas maksa:</strong> €{formData.hourly_rate}/h</p>
                      <p><strong>Izglītība:</strong></p>
                      <ul className="list-disc list-inside">
                        {formData.education.map((edu, index) => (
                          <li key={index}>{edu}</li>
                        ))}
                      </ul>
                      <p><strong>Pieredze:</strong></p>
                      <ul className="list-disc list-inside">
                        {formData.experience.map((exp, index) => (
                          <li key={index}>{exp}</li>
                        ))}
                      </ul>
                      <p><strong>Specializācijas:</strong></p>
                      <ul className="list-disc list-inside">
                        {formData.specializations.map((spec, index) => (
                          <li key={index}>{spec}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setStep(3)}
                  >
                    Atpakaļ
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Saglabā...
                      </>
                    ) : (
                      'Saglabāt profilu'
                    )}
                  </button>
          </div>
        </div>
      </div>
          </form>
        </div>
      </div>
    </div>
  );
} 