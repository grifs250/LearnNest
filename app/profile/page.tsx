"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { User, Settings2, LogOut, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import TeacherBookings from "@/components/TeacherBookings";
import StudentLessons from "@/components/StudentLessons";
import WorkSchedule from "@/components/WorkSchedule";
import UserInfoCard from "@/components/UserInfoCard";
import { ProfileData } from "@/types/profile";
import LessonForm from "@/components/LessonForm";
import { signOut } from "firebase/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) return;
      
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProfile({ ...docSnap.data(), uid: docSnap.id } as ProfileData);
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth?mode=login');
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Neizdevās iziet no sistēmas. Lūdzu, mēģiniet vēlreiz.");
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-16">
                  <User size={40} />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                <span className={`badge ${profile.isTeacher ? 'badge-secondary' : 'badge-primary'}`}>
                  {profile.isTeacher ? 'Pasniedzējs' : 'Skolēns'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/profile/setup" className="btn btn-outline gap-2">
                <Settings2 size={18} />
                Rediģēt Profilu
              </Link>
              <button 
                onClick={handleSignOut} 
                className="btn btn-outline btn-error gap-2"
              >
                <LogOut size={18} />
                Iziet
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Info - Simplified */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Par mani</h2>
              <div className="prose">
                {profile.about ? (
                  <p>{profile.about}</p>
                ) : (
                  <p className="text-base-content/50">
                    {profile.isTeacher 
                      ? "Pastāstiet par savu pieredzi un mācīšanas stilu..."
                      : "Pastāstiet par sevi un saviem mācību mērķiem..."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Work Schedule (Teachers only) */}
          {profile.isTeacher && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Darba grafiks</h2>
                <WorkSchedule teacherId={profile.uid} isEditable={true} />
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lessons/Bookings Section */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">
                  {profile.isTeacher ? 'Manas Nodarbības' : 'Manas Rezervācijas'}
                </h2>
                {profile.isTeacher ? (
                  <div 
                    onClick={() => {
                      const dialog = document.getElementById('new-lesson-dialog') as HTMLDialogElement;
                      if (dialog) dialog.showModal();
                    }}
                    className="btn btn-primary gap-2"
                  >
                    <Plus size={18} />
                    Jauna Nodarbība
                  </div>
                ) : (
                  <Link href="/#subjects" className="btn btn-primary gap-2">
                    <Plus size={18} />
                    Pieteikties Nodarbībai
                  </Link>
                )}
              </div>
              {profile.isTeacher ? (
                <TeacherBookings teacherId={profile.uid} />
              ) : (
                <StudentLessons studentId={profile.uid} />
              )}
            </div>
          </div>

          {/* Calendar Section */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Kalendārs</h2>
              {/* Calendar component would go here */}
              <div className="text-base-content/70 text-center py-8">
                Kalendāra komponente tiks pievienota drīzumā
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Lesson Dialog */}
      <dialog id="new-lesson-dialog" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Izveidot Jaunu Nodarbību</h3>
          <LessonForm onLessonCreated={() => {
            const dialog = document.getElementById('new-lesson-dialog') as HTMLDialogElement;
            if (dialog) dialog.close();
          }} />
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost">Aizvērt</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
