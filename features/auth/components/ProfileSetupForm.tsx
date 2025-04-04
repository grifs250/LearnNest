"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { RoleSelectionForm } from "./RoleSelectionForm";
import { StudentRoleForm } from "./StudentRoleForm";
import { TeacherRoleForm } from "./TeacherRoleForm";
import { useToast } from "@/features/shared/hooks/useToast";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from "@/lib/types/database.types";
import { 
  CheckCircle2, 
  UserCog, 
  BookOpen, 
  GraduationCap, 
  ArrowLeft, 
  ArrowRight,
  User,
  Loader2,
  Info,
  X,
  Plus
} from "lucide-react";
import { z } from "zod";

// Form validation schemas
const commonSchema = z.object({
  full_name: z.string().min(3, "Vārds un uzvārds ir obligāts (min. 3 simboli)"),
  bio: z.string().min(10, "Lūdzu, ievadiet vismaz 10 rakstzīmes").max(500, "Maksimālais garums ir 500 rakstzīmes"),
  age: z.number().min(13, "Vecumam jābūt vismaz 13 gadi").nullable(),
  phone: z.string().regex(/^\+?[0-9\s]+$/, "Nederīgs tālruņa numurs").min(8, "Pārāk īss numurs"),
  languages: z.array(z.string()).min(1, "Izvēlieties vismaz vienu valodu")
});

const studentSchema = commonSchema.extend({
  learning_goals: z.array(z.string()).min(1, "Pievienojiet vismaz vienu mācīšanās mērķi")
});

const teacherSchema = commonSchema.extend({
  education: z.array(z.string()).min(1, "Pievienojiet vismaz vienu izglītības ierakstu"),
  experience: z.array(z.string()).min(1, "Pievienojiet vismaz vienu pieredzes ierakstu"),
  work_hours: z.object({
    schedule: z.record(z.array(z.object({
      start: z.string(),
      end: z.string()
    }))).refine((schedule) => {
      // At least one day should have at least one time block
      return Object.values(schedule).some(blocks => blocks.length > 0);
    }, "Pievienojiet vismaz vienu darba laika bloku")
  })
});

// Add available languages constant
const AVAILABLE_LANGUAGES = [
  "Latviešu",
  "Angļu",
  "Krievu",
  "Vācu",
  "Franču",
  "Spāņu",
  "Itāļu",
  "Lietuviešu",
  "Igauņu",
  "Poļu"
].sort();

export function ProfileSetupForm() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  
  // State for Supabase client
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);
  
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
    education: [] as string[],
    experience: [] as string[],
    work_hours: {
      schedule: {} as Record<string, Array<{ start: string; end: string }>>
    }
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Add state for language dropdown
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  // Add this state for language search
  const [languageSearch, setLanguageSearch] = useState("");

  // Initialize Supabase client with JWT token
  useEffect(() => {
    if (!isLoaded || !user) return;
    
    const initSupabase = async () => {
      try {
        // Get Clerk JWT token WITHOUT specifying a template 
        // This will avoid the role issue in the JWT
        const token = await getToken();
        
        if (!token) {
          console.error("No JWT token returned from Clerk");
          showToast({
            type: "error",
            title: "Autentifikācijas kļūda",
            description: "Neizdevās iegūt autentifikācijas tokenu"
          });
          return;
        }
        
        console.log("✅ JWT token obtained from Clerk");
        
        // Create Supabase client with the token
        const supabaseClient = createSupabaseClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            },
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            }
          }
        );
        
        console.log("✅ Supabase client initialized with JWT token");
        setSupabase(supabaseClient);
      } catch (error) {
        console.error("❌ Error initializing Supabase client:", error);
        showToast({
          type: "error",
          title: "Kļūda",
          description: "Neizdevās izveidot savienojumu ar datubāzi"
        });
      }
    };
    
    initSupabase();
    
    // Set up a refresh interval to keep the token fresh
    const tokenRefreshInterval = setInterval(async () => {
      try {
        const newToken = await getToken();
        
        if (!newToken) {
          console.error("No JWT token returned during refresh");
          return;
        }
        
        console.log("🔄 Refreshing Supabase client with new JWT token");
        
        // Create a new Supabase client with the fresh token
        const refreshedClient = createSupabaseClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${newToken}`
              }
            },
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            }
          }
        );
        
        setSupabase(refreshedClient);
        console.log("✅ Supabase client refreshed with new token");
      } catch (error) {
        console.error("❌ Error refreshing Supabase client:", error);
      }
    }, 4 * 60 * 1000); // Refresh every 4 minutes to avoid 5-minute JWT expiration
    
    return () => {
      clearInterval(tokenRefreshInterval);
    };
  }, [isLoaded, user, getToken, showToast]);

  // Load initial role from Clerk metadata
  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.unsafeMetadata?.role as 'student' | 'teacher' | null;
      
      // Prefill form with existing user data
      setFormData({
        ...formData,
        full_name: user.fullName || "",
        // Load other fields if they exist in metadata
      });
      
      if (userRole) {
        setRole(userRole);
      }
    }
  }, [isLoaded, user]);

  // Handle role selection
  const handleRoleSelect = async (selectedRole: 'student' | 'teacher') => {
    setRole(selectedRole);
    
    // Store in localStorage as a backup
    localStorage.setItem('userRole', selectedRole);
    
    // Try to update Clerk metadata
    try {
      setIsLoading(true);
      if (user) {
        await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role: selectedRole
        }
      });
      }
    } catch (error) {
      console.error("Error updating role:", error);
      showToast({
        type: "error",
        title: "Kļūda",
        description: "Neizdevās saglabāt lomu"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update the language handling functions
  const handleAddLanguage = (language: string) => {
    const trimmedLanguage = language.trim();
    if (trimmedLanguage && !formData.languages.includes(trimmedLanguage)) {
      setFormData({
        ...formData,
        languages: [...formData.languages, trimmedLanguage]
      });
    }
    setLanguageSearch("");
    setShowLanguageDropdown(false);
  };

  const handleRemoveLanguage = (language: string) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter(lang => lang !== language)
    });
  };

  // Validate current step
  const validateStep = (currentStep: number): boolean => {
    try {
      setFormErrors({});
      
      if (currentStep === 1) {
        if (!role) {
          setFormErrors({ role: "Lūdzu, izvēlieties savu lomu" });
          return false;
        }

        // Validate all required fields
        const validationResult = commonSchema.safeParse(formData);
        if (!validationResult.success) {
          const newErrors: Record<string, string> = {};
          validationResult.error.errors.forEach((err) => {
            const path = err.path.join('.');
            newErrors[path] = err.message;
          });
          setFormErrors(newErrors);
          return false;
        }
      }
      
      if (currentStep === 2) {
        if (role === 'student') {
          studentSchema.parse(formData);
        } else if (role === 'teacher') {
          teacherSchema.parse(formData);
        }
      }
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setFormErrors(newErrors);
      }
      return false;
    }
  };

  // Navigation handlers
  const goToNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      showToast({
        type: "error",
        title: "Validācijas kļūda",
        description: "Lūdzu, pārbaudiet ievadītos datus"
      });
    }
  };

  const goToPrevStep = () => {
    setStep(step - 1);
  };

  // Get a fresh Supabase client with the latest token
  const getFreshSupabaseClient = async (): Promise<SupabaseClient<Database> | null> => {
    try {
      const token = await getToken();
      
      if (!token) {
        console.error("No JWT token returned from Clerk");
        return null;
      }
      
      console.log("🔄 Creating fresh Supabase client with new token");
      
      return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          }
        }
      );
    } catch (error) {
      console.error("❌ Error creating fresh Supabase client:", error);
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast({
        type: "error",
        title: "Kļūda",
        description: "Nav iespējams saglabāt profilu, lūdzu mēģiniet vēlreiz"
      });
      return;
    }
    
    // Final validation
    try {
      if (role === 'student') {
        studentSchema.parse(formData);
      } else if (role === 'teacher') {
        teacherSchema.parse(formData);
      } else {
        throw new Error("Loma nav izvēlēta");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setFormErrors(newErrors);
        showToast({
          type: "error",
          title: "Validācijas kļūda",
          description: "Lūdzu, pārbaudiet ievadītos datus"
        });
        // Go back to the appropriate step
        if (newErrors.education || newErrors.experience || (newErrors.work_hours && role === 'teacher') || newErrors.learning_goals) {
          setStep(2);
        } else {
          setStep(1);
        }
        return;
      }
    }
    
    try {
      setIsLoading(true);
      
      // Make sure role is explicitly set to one of the valid enum values
      const userRole = role === 'teacher' ? 'teacher' : 'student';
      
      // First update Clerk metadata
      console.log("🔄 Updating Clerk metadata with role:", userRole);
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role: userRole,
          profile_completed: true,
          profile_needs_setup: false
        }
      });

      // Prepare profile data to send to our API endpoint
      const profileData = {
        // Direct fields from the profiles table
        user_id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        full_name: formData.full_name,
        role: userRole,
        bio: formData.bio,
        phone: formData.phone,
        is_active: true,
        age: formData.age,
        languages: formData.languages,
        
        // Role-specific fields
        ...(userRole === 'student' ? {
          learning_goals: formData.learning_goals,
        } : {}),
        
        // Teacher-specific fields
        ...(userRole === 'teacher' ? {
          // For teacher_bio field - combine bio with education and experience
          teacher_bio: formData.bio ? 
            formData.bio +
            (formData.education.length > 0 ? 
              `\n\nIzglītība:\n${formData.education.join('\n')}` : '') +
            (formData.experience.length > 0 ? 
              `\n\nPieredze:\n${formData.experience.join('\n')}` : '') : '',
          hourly_rate: 5.00, // Default initial rate
          work_hours: formData.work_hours
        } : {}),
        
        // Minimal metadata - only system flags
        metadata: {
          profile_setup_date: new Date().toISOString(),
          profile_completed: true
        }
      };

      console.log("📝 Sending profile data to API:", JSON.stringify(profileData, null, 2));

      // Send data to our API endpoint
      const response = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const result = await response.json();
      console.log("✅ Profile saved successfully:", result);
      
      showToast({
        type: "success",
        title: "Profils saglabāts",
        description: "Jūsu profils ir veiksmīgi saglabāts"
      });
      
      // Set loading state for redirect
      setIsLoading(true);
      
      // Add a small delay before redirect to ensure data is properly saved
      setTimeout(() => {
        // Force a cache refresh
        router.refresh();
        
        // Redirect based on role
        if (userRole === 'teacher') {
          window.location.href = "/teacher";
        } else {
          window.location.href = "/student";
        }
      }, 1000);
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      // Enhanced error reporting
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      } else if (typeof error === 'object' && error !== null) {
        console.error("Error object:", JSON.stringify(error, null, 2));
      }
      
      showToast({
        type: "error",
        title: "Kļūda",
        description: "Neizdevās saglabāt profilu. Lūdzu, mēģiniet vēlreiz."
      });
      
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

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Pamata informācija";
      case 2:
        return role === 'teacher' ? "Pasniedzēja informācija" : "Skolēna informācija";
      case 3:
        return "Īsa pamācība";
      default:
        return "Profila iestatīšana";
    }
  };

  // Render form based on step
    return (
    <div className="min-h-screen bg-base-200 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-base-100 rounded-lg shadow-lg overflow-hidden">
          {/* Progress Bar */}
          <div className="w-full bg-base-200">
            <div 
              className="h-1 bg-primary transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
          
          {/* Header */}
          <div className="p-6 pb-4">
            <h1 className="text-2xl font-bold text-center mb-2">Profila iestatīšana</h1>
            <p className="text-center text-base-content/70 mb-6">
              {getStepTitle()}
            </p>
            
            {/* Step indicators */}
            <div className="flex justify-between items-center px-4 mb-6">
              <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary' : 'text-base-content/40'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${step >= 1 ? 'bg-primary text-primary-content' : 'bg-base-300'}`}>
                  <User size={20} />
                </div>
                <span className="text-xs">Pamatinformācija</span>
              </div>
              
              <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-base-300'}`}></div>
              
              <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary' : 'text-base-content/40'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${step >= 2 ? 'bg-primary text-primary-content' : 'bg-base-300'}`}>
                  {role === 'teacher' ? <GraduationCap size={20} /> : <BookOpen size={20} />}
                </div>
                <span className="text-xs">{role === 'teacher' ? 'Pasniedzējs' : 'Skolēns'}</span>
              </div>
              
              <div className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-base-300'}`}></div>
              
              <div className={`flex flex-col items-center ${step >= 3 ? 'text-primary' : 'text-base-content/40'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${step >= 3 ? 'bg-primary text-primary-content' : 'bg-base-300'}`}>
                  <Info size={20} />
                </div>
                <span className="text-xs">Pamācība</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 pt-0">
            {/* Step 1: Role Selection + Basic Information */}
            <div className={`${step === 1 ? 'block' : 'hidden'}`}>
              <div className="space-y-6">
                <div className="mb-6">
              <RoleSelectionForm 
                onSelect={handleRoleSelect} 
                isLoading={isLoading}
                initialRole={role}
              />
                  {formErrors.role && (
                    <p className="text-error text-sm mt-2">{formErrors.role}</p>
                  )}
            </div>

                <div className="divider my-8">Pamatinformācija</div>
                
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Vārds, uzvārds</span>
                    <span className="label-text-alt text-error">*</span>
                  </label>
                  <input
                    type="text"
                    spellCheck="false"
                    className={`input input-bordered w-full ${formErrors.full_name ? 'input-error' : ''}`}
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                  {formErrors.full_name && (
                    <p className="text-error text-sm mt-1">{formErrors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Bio</span>
                  </label>
                  <textarea
                    spellCheck="false"
                    className={`textarea textarea-bordered w-full ${formErrors.bio ? 'textarea-error' : ''}`}
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    placeholder="Pastāstiet par sevi, jūsu pieredzi, interesēm un ko jūs vēlaties sasniegt. Šī informācija būs redzama jūsu publiskajā profilā."
                  />
                  {formErrors.bio && (
                    <p className="text-error text-sm mt-1">{formErrors.bio}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                      <span className="label-text font-medium">Vecums</span>
                  </label>
                  <input
                    type="number"
                      spellCheck="false"
                      className={`input input-bordered w-full ${formErrors.age ? 'input-error' : ''}`}
                    value={formData.age || ''}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Jūsu vecums"
                      min="13"
                  />
                    {formErrors.age && (
                      <p className="text-error text-sm mt-1">{formErrors.age}</p>
                    )}
                </div>

                <div>
                  <label className="label">
                      <span className="label-text font-medium">Tālrunis</span>
                  </label>
                  <input
                    type="tel"
                      spellCheck="false"
                      className={`input input-bordered w-full ${formErrors.phone ? 'input-error' : ''}`}
                      value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+371 12345678"
                  />
                    {formErrors.phone && (
                      <p className="text-error text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Valodas</span>
                    <span className="label-text-alt text-error">*</span>
                  </label>
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                  <input
                    type="text"
                            spellCheck="false"
                            className={`input input-bordered w-full pr-8 ${formErrors.languages ? 'input-error' : ''}`}
                            placeholder="Ierakstiet vai izvēlieties valodu"
                            value={languageSearch}
                            onChange={(e) => {
                              setLanguageSearch(e.target.value);
                              if (e.target.value) {
                                setShowLanguageDropdown(true);
                              }
                            }}
                            onFocus={() => setShowLanguageDropdown(true)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && languageSearch.trim()) {
                                e.preventDefault();
                                handleAddLanguage(languageSearch);
                              } else if (e.key === 'Escape') {
                                setShowLanguageDropdown(false);
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/70 hover:text-primary transition-colors"
                            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                          >
                            <Plus size={18} className={`transform transition-transform ${showLanguageDropdown ? 'rotate-45' : ''}`} />
                          </button>
                        </div>
                      </div>
                      
                      {showLanguageDropdown && (
                        <div className="absolute bottom-full left-0 right-0 mb-1 bg-base-100 border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                          {languageSearch ? (
                            <>
                              {/* Show filtered languages */}
                              {AVAILABLE_LANGUAGES
                                .filter(lang => 
                                  lang.toLowerCase().includes(languageSearch.toLowerCase()) &&
                                  !formData.languages.includes(lang)
                                )
                                .map((language) => (
                                  <button
                                    key={language}
                                    type="button"
                                    className="w-full px-4 py-2 text-left hover:bg-base-200 transition-colors"
                                    onClick={() => handleAddLanguage(language)}
                                  >
                                    {language}
                                  </button>
                                ))}
                              
                              {/* Show option to add custom language if no matches */}
                              {!AVAILABLE_LANGUAGES.some(lang => 
                                lang.toLowerCase().includes(languageSearch.toLowerCase())
                              ) && (
                                <button
                                  type="button"
                                  className="w-full px-4 py-2 text-left hover:bg-base-200 transition-colors text-primary"
                                  onClick={() => handleAddLanguage(languageSearch)}
                                >
                                  + Pievienot "{languageSearch}"
                                </button>
                              )}
                            </>
                          ) : (
                            // Show all available languages when no search
                            AVAILABLE_LANGUAGES
                              .filter(lang => !formData.languages.includes(lang))
                              .map((language) => (
                                <button
                                  key={language}
                                  type="button"
                                  className="w-full px-4 py-2 text-left hover:bg-base-200 transition-colors"
                                  onClick={() => handleAddLanguage(language)}
                                >
                                  {language}
                                </button>
                              ))
                          )}
                        </div>
                      )}
                </div>

                    {formData.languages.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.languages.map((language) => (
                          <div key={language} className="badge badge-primary gap-1 p-3">
                            <span>{language}</span>
                  <button
                    type="button"
                              className="btn btn-ghost btn-xs btn-circle"
                              onClick={() => handleRemoveLanguage(language)}
                  >
                              <X size={14} />
                  </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {formErrors.languages && (
                      <p className="text-error text-sm">{formErrors.languages}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    disabled={!role}
                    className={`btn ${role === 'student' ? 'btn-accent' : role === 'teacher' ? 'btn-secondary' : 'btn-primary'} px-6 gap-2`}
                    onClick={goToNextStep}
                  >
                    Tālāk
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Role-Specific Information */}
            <div className={`${step === 2 ? 'block' : 'hidden'}`}>
              {role === 'student' ? (
                <StudentRoleForm
                  formData={formData}
                  setFormData={setFormData}
                  onBack={goToPrevStep}
                  onNext={goToNextStep}
                  errors={formErrors}
                />
              ) : (
                <TeacherRoleForm
                  formData={formData}
                  setFormData={setFormData}
                  onBack={goToPrevStep}
                  onNext={goToNextStep}
                  errors={formErrors}
                />
              )}
            </div>

            {/* Step 3: Quick Start Guide */}
            <div className={`${step === 3 ? 'block' : 'hidden'}`}>
              <div className="space-y-6">
                <div className="bg-base-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Īsa pamācība</h3>
                  
                  {role === 'student' ? (
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="bg-accent/30 text-accent rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
                        <div>
                          <h4 className="font-medium">Atrodiet pasniedzēju</h4>
                          <p className="text-sm text-base-content/70">Meklējiet skolotājus pēc priekšmeta un pieejamības</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 items-start">
                        <div className="bg-accent/30 text-accent rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
                        <div>
                          <h4 className="font-medium">Plānojiet stundas</h4>
                          <p className="text-sm text-base-content/70">Izvēlieties piemērotu laiku un rezervējiet stundu</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 items-start">
                        <div className="bg-accent/30 text-accent rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
                        <div>
                          <h4 className="font-medium">Mācieties tiešsaistē</h4>
                          <p className="text-sm text-base-content/70">Pievienojieties tiešsaistes stundai vai izvēlieties klātienes tikšanos</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="bg-secondary/30 text-secondary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
                        <div>
                          <h4 className="font-medium">Izveidojiet nodarbības</h4>
                          <p className="text-sm text-base-content/70">Piedāvājiet mācību stundas, norādot tēmu un cenu</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 items-start">
                        <div className="bg-secondary/30 text-secondary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
                        <div>
                          <h4 className="font-medium">Pārvaldiet grafiku</h4>
                          <p className="text-sm text-base-content/70">Iestatiet pieejamās stundas un laikus</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 items-start">
                        <div className="bg-secondary/30 text-secondary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
                        <div>
                          <h4 className="font-medium">Vadiet nodarbības</h4>
                          <p className="text-sm text-base-content/70">Pasniegšanas laikā izmantojiet tiešsaistes platformu vai tiecieties klātienē</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-8">
                  {step > 1 && (
                  <button
                    type="button"
                      className="btn btn-ghost gap-2 mr-2"
                      onClick={goToPrevStep}
                      disabled={isLoading}
                  >
                      <ArrowLeft size={16} />
                    Atpakaļ
                  </button>
                  )}
                  
                  <button
                    type={step === 3 ? "submit" : "button"}
                    className={`btn ${role === 'student' ? 'btn-accent' : role === 'teacher' ? 'btn-secondary' : 'btn-primary'} px-6 gap-2`}
                    onClick={step < 3 ? goToNextStep : undefined}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {step === 3 ? 'Saglabā un pāradresē...' : 'Apstrādā...'}
                      </>
                    ) : step === 3 ? (
                      <>
                        Pabeigt
                        <CheckCircle2 size={16} />
                      </>
                    ) : (
                      <>
                        Tālāk
                        <ArrowRight size={16} />
                      </>
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