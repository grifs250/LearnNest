import { getProfileByUserId } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import ErrorDisplay from '../../../shared/components/ErrorDisplay';
import { auth } from '@clerk/nextjs/server';

interface PageProps {
  params: {
    userId: string;
  };
}

// Separate function to check if user needs setup
// This allows us to use it in both metadata and page component
async function checkUserNeedsSetup(userId: string): Promise<boolean> {
  // Ensure userId is resolved
  const resolvedUserId = await Promise.resolve(userId);
  
  if (!resolvedUserId.startsWith('user_')) return false;
  
  // Check if this user has a profile
  const profile = await getProfileByUserId(resolvedUserId);
  
  if (profile) return false; // Profile exists, no setup needed
  
  // No profile - check if this is the current user
  const authState = await auth();
  const currentUserId = authState.userId;
  
  // Only redirect if this is the current user viewing their own missing profile
  return currentUserId === resolvedUserId;
}

export async function generateMetadata({ params }: PageProps) {
  // Await the params object before destructuring
  const resolvedParams = await Promise.resolve(params);
  const userId = resolvedParams.userId;
  
  console.log('generateMetadata for profiles/[userId] with userId:', userId);
  
  // Check if redirection is needed and handle differently than in the main component
  const needsSetup = await checkUserNeedsSetup(userId);
  
  if (needsSetup) {
    console.log('Current user needs profile setup (metadata)');
    return {
      title: 'Nepieciešama profila iestatīšana | MāciesTe',
      description: 'Jums jāaizpilda profila iestatīšanas process.'
    };
  }
  
  if (userId.startsWith('user_')) {
    try {
      const profile = await getProfileByUserId(userId);
      
      if (!profile) {
        console.log('No profile found in database - not current user');
        return {
          title: 'Profils nav atrasts | MāciesTe',
          description: 'Lietotāja profils nav atrasts vai nav pieejams.'
        };
      }
      
      return {
        title: `${profile.full_name} - ${profile.role === 'teacher' ? 'Pasniedzējs' : 'Skolēns'} | MāciesTe`,
        description: profile.bio || `${profile.full_name} profils MāciesTe platformā.`
      };
    } catch (error) {
      console.error('Error generating metadata:', error);
      return {
        title: 'Profila kļūda | MāciesTe',
        description: 'Radās kļūda ielādējot profilu.'
      };
    }
  } else {
    // Non-Clerk ID format
    return {
      title: 'Nepareizs ID formāts | MāciesTe',
      description: 'Nepareizs lietotāja ID formāts.'
    };
  }
}

export default async function ProfilePage({ params }: PageProps) {
  // Await the params object before destructuring
  const resolvedParams = await Promise.resolve(params);
  const userId = resolvedParams.userId;
  
  console.log('Rendering ProfilePage for userId:', userId);
  
  // Check if redirection is needed
  const needsSetup = await checkUserNeedsSetup(userId);
  
  if (needsSetup) {
    console.log('⚠️ Current user needs profile setup, forcing redirect');
    // This should stop page rendering and redirect immediately
    return redirect('/profile/setup');
  }
  
  try {
    // Only proceed if we're not redirecting
    if (userId.startsWith('user_')) {
      const profile = await getProfileByUserId(userId);
      
      if (!profile) {
        console.log('Profile not found, showing 404 page. userId:', userId);
        notFound();
      }
      
      console.log('Profile found:', { 
        id: profile.id, 
        user_id: profile.user_id, 
        role: profile.role 
      });
      
      const joinedDate = profile.created_at ? 
        new Date(profile.created_at).toLocaleDateString('lv-LV', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'Nesen';
      
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-32 h-32 relative rounded-full overflow-hidden border-4 border-primary">
                {profile.avatar_url ? (
                  <Image 
                    src={profile.avatar_url} 
                    alt={profile.full_name || "Lietotāja profila attēls"} 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-500">
                      {profile.full_name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                <p className="text-gray-600 mb-4">
                  {profile.role === 'teacher' ? 'Pasniedzējs' : 'Skolēns'}
                </p>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Pievienojās: {joinedDate}</p>
                </div>
                
                {profile.bio && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Par mani</h2>
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                )}
                
                {profile.role === 'teacher' && profile.subjects && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Mācību priekšmeti</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.subjects.map((subject: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {profile.role === 'student' && profile.learning_goals && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Mācību mērķi</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.learning_goals.map((goal: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Invalid user ID format
      console.error('Invalid user ID format (should start with "user_"):', userId);
      notFound();
    }
  } catch (error) {
    console.error('Error in ProfilePage:', error);
    return <ErrorDisplay />;
  }
} 