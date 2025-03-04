import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { generateDynamicMetadata } from '@/components/SEO/DynamicMetadata';
import { notFound } from 'next/navigation';
import TeacherProfile from '@/shared/components/TeacherProfile';
import { UserProfile } from '@/types/database';

interface TeacherPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: TeacherPageProps): Promise<Metadata> {
  const teacher = await getTeacherProfile(params.slug);
  
  if (!teacher) {
    return {
      title: 'Pasniedzējs nav atrasts | MāciesTe',
      description: 'Meklētais pasniedzējs nav atrasts mūsu platformā.'
    };
  }
  
  // Extract metadata values
  const experienceYears = teacher.teacher_experience_years || 0;
  
  return {
    title: `${teacher.full_name} - ${teacher.page_title || "Pasniedzējs"} | MāciesTe`,
    description: teacher.page_description || `${teacher.full_name} - pasniedzējs ar ${experienceYears} gadu pieredzi. Piesakies nodarbībām jau šodien!`,
    openGraph: {
      images: teacher.avatar_url ? [teacher.avatar_url] : [],
      title: `${teacher.full_name} - ${teacher.page_title || "Pasniedzējs"} | MāciesTe`,
      description: teacher.page_description || `${teacher.full_name} - pasniedzējs ar ${experienceYears} gadu pieredzi. Piesakies nodarbībām jau šodien!`,
    },
  };
}

export default async function TeacherPage({ params }: TeacherPageProps) {
  const teacher = await getTeacherProfile(params.slug);
  
  if (!teacher) {
    return notFound();
  }
  
  return <TeacherProfile teacher={teacher} />;
}

async function getTeacherProfile(slug: string): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("url_slug", slug)
      .eq("profile_type", "teacher")
      .eq("is_active", true)
      .single();
    
    if (error || !data) {
      console.error("Error fetching teacher profile:", error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error("Error in getTeacherProfile:", error);
    return null;
  }
} 