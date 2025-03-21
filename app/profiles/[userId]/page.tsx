import { getProfileByUserId } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const profile = await getProfileByUserId(params.userId);
  
  if (!profile) {
    return {
      title: 'Profils nav atrasts | MāciesTe',
      description: 'Lietotāja profils nav atrasts vai nav pieejams.'
    };
  }
  
  return {
    title: `${profile.full_name} - ${profile.role === 'teacher' ? 'Pasniedzējs' : 'Skolēns'} | MāciesTe`,
    description: profile.bio || `${profile.full_name} profils MāciesTe platformā.`
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const profile = await getProfileByUserId(params.userId);
  
  if (!profile) {
    notFound();
  }
  
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
} 