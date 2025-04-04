import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TeacherProfile } from '@/features/shared/components';
import { createServerClient } from '@/lib/supabase/server';

// Define types
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

// Metadata generation
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = await createServerClient();
  const { data: teacher } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', params.slug)
    .eq('profile_type', 'teacher')
    .single();

  if (!teacher) {
    return {
      title: 'Pasniedzējs nav atrasts',
      description: 'Diemžēl meklētais pasniedzējs nav atrasts.'
    };
  }

  return {
    title: `${teacher.full_name} | MāciesTe`,
    description: teacher.teacher_bio || 'Iepazīsti pasniedzēju un pieraksties uz nodarbībām tiešsaistē.',
  };
}

export default async function TeacherProfilePage({ params }: { params: { slug: string } }) {
  const supabase = await createServerClient();
  
  // Use user_id to find teacher
  const { data: teacher, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', params.slug)
    .eq('profile_type', 'teacher')
    .single();

  if (error || !teacher) {
    console.error('Error fetching teacher:', error);
    notFound();
  }

  return (
    <main>
      <TeacherProfile teacher={teacher as UserProfile} />
    </main>
  );
} 