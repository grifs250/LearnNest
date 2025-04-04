"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/features/shared/components/ui';
import { useUser } from '@clerk/nextjs';
import { useAuth } from '@/features/auth';
import { initializeUserProfile } from '@/lib/utils/profile';
import { toast } from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/lib/types/common.types';
import { StudentBookings, TeacherBookings } from '@/features/bookings/components';
import { formatClerkId } from '@/lib/utils/user';
import { Edit, Save, Plus, X, Calendar, Book, Clock } from 'lucide-react';

// Define SupabaseError type inline
interface SupabaseError {
  code: string;
  message: string;
  details?: string;
}

// Define UserProfile type inline to match what we need in this component
interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  profile_type: 'student' | 'teacher' | 'admin';
  avatar_url: string | null;
  url_slug: string;
  page_title: string;
  page_description: string | null;
  teacher_bio: string | null;
  teacher_rate: number | null;
  teacher_experience_years: number | null;
  teacher_specializations: string[] | null;
  teacher_education: string[] | null;
  teacher_certificates: string[] | null;
  student_goals: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

interface TeacherAvailability {
  id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { isTeacher } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'lessons'>('profile');
  
  // State for editing arrays like education, specializations, etc.
  const [newEducationItem, setNewEducationItem] = useState('');
  const [newSpecializationItem, setNewSpecializationItem] = useState('');
  const [newCertificateItem, setNewCertificateItem] = useState('');
  const [newGoalItem, setNewGoalItem] = useState('');

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      const supabase = createClient();
      const formattedId = formatClerkId(user.id);
      
      try {
        const { data: existingProfile, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', formattedId)
          .single();

        if (fetchError) {
          const error = fetchError as SupabaseError;
          console.error('Profile fetch error:', {
            code: error.code,
            message: error.message,
            details: error.details
          });

          if (error.code === 'PGRST116') {
            try {
              const newProfile = await initializeUserProfile(user);
              // Create a proper UserProfile object with all required fields
              const userProfile: UserProfile = {
                id: newProfile.id,
                user_id: newProfile.user_id,
                email: newProfile.email,
                full_name: newProfile.full_name,
                profile_type: newProfile.role as 'student' | 'teacher' | 'admin',
                avatar_url: newProfile.avatar_url || null,
                url_slug: newProfile.id,
                page_title: newProfile.full_name,
                page_description: newProfile.bio || null,
                teacher_bio: null,
                teacher_rate: null,
                teacher_experience_years: null,
                teacher_specializations: null,
                teacher_education: null,
                teacher_certificates: null,
                student_goals: null,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: null
              };
              
              setProfile(userProfile);
              setEditedProfile(userProfile);
              toast.success('Profile created successfully');
            } catch (initError) {
              console.error('Profile initialization error:', initError);
              toast.error('Failed to create profile');
            }
          } else {
            toast.error(`Failed to load profile: ${error.message}`);
          }
        } else if (existingProfile) {
          setProfile(existingProfile as UserProfile);
          setEditedProfile(existingProfile as UserProfile);
          
          // Fetch availability if teacher
          if (existingProfile.profile_type === 'teacher') {
            const { data: availabilityData } = await supabase
              .from('teacher_availability')
              .select('*')
              .eq('teacher_id', existingProfile.id);
              
            if (availabilityData) {
              setAvailability(availabilityData);
            }
          }
        }
      } catch (error) {
        const err = error as Error;
        console.error('Profile error:', {
          message: err.message,
          stack: err.stack
        });
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoaded, user, router]);
  
  const handleSaveProfile = async () => {
    if (!editedProfile) return;
    
    setSaving(true);
    
    try {
      const supabase = createClient();
      
      // Update profile
      const { error } = await supabase
        .from('user_profiles')
        .update(editedProfile)
        .eq('id', editedProfile.id);
      
      if (error) {
        throw error;
      }
      
      // Update profile state
      setProfile(editedProfile);
      setIsEditing(false);
      toast.success('Profils veiksmīgi atjaunināts');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Kļūda atjauninot profilu');
    } finally {
      setSaving(false);
    }
  };
  
  // Helper functions for editing arrays
  const addEducationItem = () => {
    if (!newEducationItem.trim() || !editedProfile) return;
    
    const updatedEducation = [
      ...(editedProfile.teacher_education || []),
      newEducationItem.trim()
    ];
    
    setEditedProfile({
      ...editedProfile,
      teacher_education: updatedEducation
    });
    
    setNewEducationItem('');
  };
  
  const removeEducationItem = (index: number) => {
    if (!editedProfile?.teacher_education) return;
    
    const updatedEducation = [...editedProfile.teacher_education];
    updatedEducation.splice(index, 1);
    
    setEditedProfile({
      ...editedProfile,
      teacher_education: updatedEducation
    });
  };
  
  const addSpecializationItem = () => {
    if (!newSpecializationItem.trim() || !editedProfile) return;
    
    const updatedSpecializations = [
      ...(editedProfile.teacher_specializations || []),
      newSpecializationItem.trim()
    ];
    
    setEditedProfile({
      ...editedProfile,
      teacher_specializations: updatedSpecializations
    });
    
    setNewSpecializationItem('');
  };
  
  const removeSpecializationItem = (index: number) => {
    if (!editedProfile?.teacher_specializations) return;
    
    const updatedSpecializations = [...editedProfile.teacher_specializations];
    updatedSpecializations.splice(index, 1);
    
    setEditedProfile({
      ...editedProfile,
      teacher_specializations: updatedSpecializations
    });
  };
  
  const addCertificateItem = () => {
    if (!newCertificateItem.trim() || !editedProfile) return;
    
    const updatedCertificates = [
      ...(editedProfile.teacher_certificates || []),
      newCertificateItem.trim()
    ];
    
    setEditedProfile({
      ...editedProfile,
      teacher_certificates: updatedCertificates
    });
    
    setNewCertificateItem('');
  };
  
  const removeCertificateItem = (index: number) => {
    if (!editedProfile?.teacher_certificates) return;
    
    const updatedCertificates = [...editedProfile.teacher_certificates];
    updatedCertificates.splice(index, 1);
    
    setEditedProfile({
      ...editedProfile,
      teacher_certificates: updatedCertificates
    });
  };
  
  const addGoalItem = () => {
    if (!newGoalItem.trim() || !editedProfile) return;
    
    const updatedGoals = [
      ...(editedProfile.student_goals || []),
      newGoalItem.trim()
    ];
    
    setEditedProfile({
      ...editedProfile,
      student_goals: updatedGoals
    });
    
    setNewGoalItem('');
  };
  
  const removeGoalItem = (index: number) => {
    if (!editedProfile?.student_goals) return;
    
    const updatedGoals = [...editedProfile.student_goals];
    updatedGoals.splice(index, 1);
    
    setEditedProfile({
      ...editedProfile,
      student_goals: updatedGoals
    });
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !profile) {
    return null; // Router will handle redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <button 
          className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profils
        </button>
        <button 
          className={`tab ${activeTab === 'bookings' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Rezervācijas
        </button>
        <button 
          className={`tab ${activeTab === 'lessons' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('lessons')}
        >
          <Book className="w-4 h-4 mr-2" />
          Nodarbības
        </button>
      </div>
      
      {activeTab === 'profile' && (
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Mans Profils</h1>
            {!isEditing ? (
              <button
                className="btn btn-primary btn-sm gap-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4" />
                Rediģēt
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedProfile(profile);
                  }}
                >
                  Atcelt
                </button>
                <button
                  className="btn btn-primary btn-sm gap-2"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Saglabā...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Saglabāt
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-24 rounded-full">
                  <img 
                    src={user.imageUrl || '/default-avatar.png'} 
                    alt={user.fullName || 'Profils'} 
                  />
                </div>
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    className="input input-bordered w-full max-w-xs"
                    value={editedProfile?.full_name || ''}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile!,
                      full_name: e.target.value
                    })}
                  />
                ) : (
                  <h2 className="text-xl font-semibold">{profile.full_name}</h2>
                )}
                <p className="text-gray-600">{user.emailAddresses[0].emailAddress}</p>
                <span className="badge badge-primary mt-2">
                  {isTeacher ? 'Pasniedzējs' : 'Skolēns'}
                </span>
              </div>
            </div>

            <div className="divider"></div>

            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Pamatinformācija</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">E-pasts</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered"
                    value={editedProfile?.email || ''}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile!,
                      email: e.target.value
                    })}
                    readOnly={!isEditing}
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Publiskā profila saite</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={editedProfile?.url_slug || ''}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile!,
                      url_slug: e.target.value
                    })}
                    readOnly={!isEditing}
                  />
                </div>
              </div>
              
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows={4}
                  value={editedProfile?.teacher_bio || ''}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile!,
                    teacher_bio: e.target.value
                  })}
                  readOnly={!isEditing}
                  placeholder="Pastāstiet par sevi, jūsu pieredzi, interesēm un ko jūs vēlaties sasniegt. Šī informācija būs redzama jūsu publiskajā profilā."
                />
              </div>
            </div>

            {/* Teacher Specific Info */}
            {isTeacher && profile.profile_type === 'teacher' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Pasniedzēja informācija</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Stundas likme (€)</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={editedProfile?.teacher_rate || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile!,
                        teacher_rate: parseFloat(e.target.value) || null
                      })}
                      readOnly={!isEditing}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Pieredze (gadi)</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={editedProfile?.teacher_experience_years || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile!,
                        teacher_experience_years: parseInt(e.target.value) || null
                      })}
                      readOnly={!isEditing}
                      min="0"
                    />
                  </div>
                </div>
                
                {/* Education */}
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Izglītība</span>
                  </label>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="input input-bordered flex-1"
                          value={newEducationItem}
                          onChange={(e) => setNewEducationItem(e.target.value)}
                          placeholder="Pievienot izglītības ierakstu"
                        />
                        <button
                          className="btn btn-primary"
                          onClick={addEducationItem}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {editedProfile?.teacher_education && editedProfile.teacher_education.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {editedProfile.teacher_education.map((item, index) => (
                            <div key={index} className="badge badge-lg gap-1 p-3">
                              <span>{item}</span>
                              <button
                                className="btn btn-ghost btn-xs btn-circle"
                                onClick={() => removeEducationItem(index)}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {profile.teacher_education && profile.teacher_education.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {profile.teacher_education.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">Nav norādīta izglītība</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Specializations */}
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Specializācijas</span>
                  </label>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="input input-bordered flex-1"
                          value={newSpecializationItem}
                          onChange={(e) => setNewSpecializationItem(e.target.value)}
                          placeholder="Pievienot specializāciju"
                        />
                        <button
                          className="btn btn-primary"
                          onClick={addSpecializationItem}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {editedProfile?.teacher_specializations && editedProfile.teacher_specializations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {editedProfile.teacher_specializations.map((item, index) => (
                            <div key={index} className="badge badge-lg gap-1 p-3">
                              <span>{item}</span>
                              <button
                                className="btn btn-ghost btn-xs btn-circle"
                                onClick={() => removeSpecializationItem(index)}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {profile.teacher_specializations && profile.teacher_specializations.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.teacher_specializations.map((item, index) => (
                            <span key={index} className="badge badge-outline">{item}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Nav norādītas specializācijas</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Certificates */}
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Sertifikāti</span>
                  </label>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="input input-bordered flex-1"
                          value={newCertificateItem}
                          onChange={(e) => setNewCertificateItem(e.target.value)}
                          placeholder="Pievienot sertifikātu"
                        />
                        <button
                          className="btn btn-primary"
                          onClick={addCertificateItem}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {editedProfile?.teacher_certificates && editedProfile.teacher_certificates.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {editedProfile.teacher_certificates.map((item, index) => (
                            <div key={index} className="badge badge-lg gap-1 p-3">
                              <span>{item}</span>
                              <button
                                className="btn btn-ghost btn-xs btn-circle"
                                onClick={() => removeCertificateItem(index)}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {profile.teacher_certificates && profile.teacher_certificates.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {profile.teacher_certificates.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">Nav norādīti sertifikāti</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Availability */}
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Pieejamība</span>
                  </label>
                  
                  {availability.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="table table-zebra">
                        <thead>
                          <tr>
                            <th>Diena</th>
                            <th>Laiks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {availability.map((slot) => (
                            <tr key={slot.id}>
                              <td>
                                {slot.day_of_week.charAt(0).toUpperCase() + slot.day_of_week.slice(1)}
                              </td>
                              <td>
                                {slot.start_time} - {slot.end_time}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">Nav iestatīti pieejamie laiki</p>
                  )}
                  
                  <div className="mt-2">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => router.push('/profile/schedule')}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Pārvaldīt pieejamību
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Student Specific Info */}
            {!isTeacher && profile.profile_type === 'student' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Skolēna informācija</h3>
                
                {/* Learning Goals */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Mācību mērķi</span>
                  </label>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="input input-bordered flex-1"
                          value={newGoalItem}
                          onChange={(e) => setNewGoalItem(e.target.value)}
                          placeholder="Pievienot mācību mērķi"
                        />
                        <button
                          className="btn btn-primary"
                          onClick={addGoalItem}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {editedProfile?.student_goals && editedProfile.student_goals.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {editedProfile.student_goals.map((item, index) => (
                            <div key={index} className="badge badge-lg gap-1 p-3">
                              <span>{item}</span>
                              <button
                                className="btn btn-ghost btn-xs btn-circle"
                                onClick={() => removeGoalItem(index)}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {profile.student_goals && profile.student_goals.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.student_goals.map((item, index) => (
                            <span key={index} className="badge badge-accent badge-outline">{item}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Nav norādīti mācību mērķi</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'bookings' && (
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Rezervācijas</h2>
          
          {isTeacher ? (
            <TeacherBookings userId={formatClerkId(user.id)} />
          ) : (
            <StudentBookings userId={formatClerkId(user.id)} />
          )}
        </div>
      )}
      
      {activeTab === 'lessons' && (
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Nodarbības</h2>
          
          <div className="alert alert-info">
            <p>Nodarbību sadaļa tiks pievienota drīzumā.</p>
          </div>
        </div>
      )}
    </div>
  );
}
