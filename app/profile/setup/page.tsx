"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ProfileData } from "@/types/profile";
import WorkSchedule from "@/components/WorkSchedule";
import LessonForm from "@/components/LessonForm";

export default function ProfileSetupPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    displayName: '',
    about: '',
    isTeacher: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) {
        router.push('/auth');
        return;
      }

      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProfile({
          displayName: docSnap.data().displayName || '',
          about: docSnap.data().about || '',
          isTeacher: docSnap.data().isTeacher || false
        });
      }
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        displayName: profile.displayName,
        about: profile.about
      });
      router.push('/profile');
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Neizdevās saglabāt profilu. Lūdzu, mēģiniet vēlreiz.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Rediģēt Profilu</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body space-y-4">
            {/* Display Name */}
            <div>
              <label className="label font-semibold">
                Vārds, Uzvārds
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={profile.displayName}
                onChange={e => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                required
              />
            </div>

            {/* About Me */}
            <div>
              <label className="label font-semibold">
                Par mani
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-32"
                value={profile.about}
                onChange={e => setProfile(prev => ({ ...prev, about: e.target.value }))}
                placeholder={profile.isTeacher 
                  ? "Pastāstiet par savu pieredzi un mācīšanas stilu..."
                  : "Pastāstiet par sevi un saviem mācību mērķiem..."}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={saving}
            >
              {saving ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Saglabāt'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 