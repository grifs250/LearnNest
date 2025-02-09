"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebaseClient';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { UserProfile } from '@/types/user';

export default function ProfileSetup() {
  const router = useRouter();
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/auth');
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
        setIsEdit(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      await setDoc(doc(db, "users", user.uid), {
        ...profile,
        uid: user.uid,
        email: user.email,
      }, { merge: true });

      router.push('/profile');
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading loading-spinner loading-lg"></div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profila iestatīšana</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Vārds, Uzvārds</label>
          <input
            type="text"
            required
            className="input input-bordered w-full"
            value={profile.displayName || ''}
            onChange={e => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={profile.bio || ''}
            onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
          />
        </div>

        {profile.role === 'teacher' && (
          <>
            <div>
              <label className="label">Izglītība</label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={profile.education || ''}
                onChange={e => setProfile(prev => ({ ...prev, education: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Pieredze</label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={profile.experience || ''}
                onChange={e => setProfile(prev => ({ ...prev, experience: e.target.value }))}
              />
            </div>
          </>
        )}

        {profile.role === 'student' && (
          <>
            <div>
              <label className="label">Klase</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={profile.grade || ''}
                onChange={e => setProfile(prev => ({ ...prev, grade: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Intereses</label>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Piem: matemātika, fizika, programmēšana"
                value={profile.interests?.join(', ') || ''}
                onChange={e => setProfile(prev => ({ 
                  ...prev, 
                  interests: e.target.value.split(',').map(i => i.trim()) 
                }))}
              />
            </div>
          </>
        )}

        <button 
          type="submit" 
          className={`btn btn-primary w-full ${saving ? 'loading' : ''}`}
          disabled={saving}
        >
          {saving ? 'Saglabā...' : isEdit ? 'Atjaunot profilu' : 'Izveidot profilu'}
        </button>
      </form>
    </div>
  );
} 