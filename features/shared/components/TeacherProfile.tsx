'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

// Simplified UserProfile type
interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  profile_type: 'student' | 'teacher' | 'admin';
  avatar_url: string | null;
  teacher_bio: string | null;
  teacher_rate: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  metadata?: {
    teacher_experience_years?: number;
    [key: string]: any;
  };
}

interface TeacherAvailability {
  id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface TeacherProfileProps {
  teacher: UserProfile;
}

export default function TeacherProfile({ teacher }: TeacherProfileProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'subjects' | 'availability'>('about');
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Format joined date
  const joinedDate = new Date(teacher.created_at).toLocaleDateString('lv-LV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Fetch teacher availability
  useEffect(() => {
    const fetchTeacherData = async () => {
      setIsLoading(true);
      const supabase = createClient();
      
      try {
        // Only fetch availability
        const { data: availabilityData } = await supabase
          .from('teacher_availability')
          .select('*')
          .eq('teacher_id', teacher.id);
          
        if (availabilityData) {
          setAvailability(availabilityData);
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeacherData();
  }, [teacher.id]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-primary/10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="avatar">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full">
                <img 
                  src={teacher.avatar_url || '/default-avatar.png'} 
                  alt={teacher.full_name}
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{teacher.full_name}</h1>
              <p className="text-lg text-gray-600">Pasniedzējs</p>
              
              <div className="mt-2 flex items-center gap-2">
                <span className="badge badge-primary">Pasniedzējs</span>
                {teacher.metadata?.teacher_experience_years && (
                  <span className="badge badge-outline">
                    {teacher.metadata.teacher_experience_years} gadu pieredze
                  </span>
                )}
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">Pievienojās: {joinedDate}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-100 px-6 pt-4">
          <button 
            className={`tab ${activeTab === 'about' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            Par pasniedzēju
          </button>
          <button 
            className={`tab ${activeTab === 'subjects' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            Mācību priekšmeti
          </button>
          <button 
            className={`tab ${activeTab === 'availability' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            Pieejamība
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          ) : (
            <>
              {activeTab === 'about' && (
                <div>
                  {teacher.teacher_bio && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">Par mani</h2>
                      <p className="text-gray-700 whitespace-pre-line">{teacher.teacher_bio}</p>
                    </div>
                  )}
                  
                  {teacher.teacher_rate && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Stundas likme</h3>
                      <p className="text-2xl font-bold text-primary">{teacher.teacher_rate} €/h</p>
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <button className="btn btn-primary btn-lg">
                      Pieteikties nodarbībai
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'subjects' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Mācību priekšmeti</h2>
                  <p className="text-gray-600">Informācija par pasniedzēja mācību priekšmetiem tiks pievienota drīzumā.</p>
                </div>
              )}
              
              {activeTab === 'availability' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Pieejamība</h2>
                  
                  {availability && availability.length > 0 ? (
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
                    <p className="text-gray-600">Pasniedzējam nav norādīti pieejamie laiki.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 