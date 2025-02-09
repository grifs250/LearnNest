"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { ProfileData } from "@/types/profile";
import Link from "next/link";

interface PublicProfileProps {
  userId: string;
}

export default function PublicProfile({ userId }: PublicProfileProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile({
          ...docSnap.data() as ProfileData,
          uid: userId
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-error">Profile not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl">
                {profile.displayName}
                <span className={`badge ${profile.isTeacher ? 'badge-secondary' : 'badge-primary'}`}>
                  {profile.isTeacher ? 'Pasniedzējs' : 'Skolēns'}
                </span>
              </h2>
              {profile.description && <p className="mt-2">{profile.description}</p>}
            </div>
          </div>

          {profile.isTeacher ? (
            <>
              {profile.education && (
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title">Izglītība</h3>
                    <p>{profile.education}</p>
                  </div>
                </div>
              )}

              {profile.experience && (
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title">Pieredze</h3>
                    <p>{profile.experience}</p>
                  </div>
                </div>
              )}

              {profile.subjects && profile.subjects.length > 0 && (
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title">Mācību priekšmeti</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.subjects.map(subject => (
                        <span key={subject} className="badge badge-secondary">{subject}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {profile.grade && (
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title">Klase</h3>
                    <p>{profile.grade}</p>
                  </div>
                </div>
              )}

              {profile.interests && profile.interests.length > 0 && (
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title">Intereses</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map(interest => (
                        <span key={interest} className="badge badge-primary">{interest}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column - Available Lessons or Contact */}
        <div className="lg:col-span-2 space-y-6">
          {profile.isTeacher && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Pieejamās nodarbības</h2>
                <Link 
                  href={`/lessons/teacher/${profile.uid}`}
                  className="btn btn-primary"
                >
                  Skatīt nodarbības
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 