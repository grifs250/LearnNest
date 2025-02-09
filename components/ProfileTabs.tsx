"use client";
import { useState, useEffect } from "react";
import { ProfileData } from "@/types/profile";
import TeacherBookings from "./TeacherBookings";
import StudentLessons from "./StudentLessons";
import WorkSchedule from "./WorkSchedule";
import LessonForm from "./LessonForm";
import UserInfoCard from "./UserInfoCard";
import Link from "next/link";
import { Dialog } from "./Dialog";
import { User, signOut } from 'firebase/auth';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebaseClient';

interface ProfileTabsProps {
  readonly user: User;
  readonly isTeacher: boolean;
  readonly onEditProfile: () => void;
  readonly onDeleteAccount: () => void;
}

function createProfileFromUser(user: User, isTeacher: boolean): ProfileData {
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? 'Unnamed User',
    role: isTeacher ? 'teacher' : 'student',
    isTeacher,
    description: '',
    education: '',
    experience: '',
    subjects: [],
  };
}

export default function ProfileTabs({ user, isTeacher, onEditProfile, onDeleteAccount }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData({
          ...data,
          uid: user.uid,
          email: user.email ?? '',
          displayName: data.displayName ?? user.displayName ?? 'Unnamed User',
          role: isTeacher ? 'teacher' : 'student',
          isTeacher,
        } as ProfileData);
      }
    }
    loadProfile();
  }, [user.uid, user.email, user.displayName, isTeacher]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user.uid) return;

    try {
      // 1. Delete all lessons created by the teacher or booked by the student
      const lessonsQuery = query(
        collection(db, "lessons"),
        where(isTeacher ? "teacherId" : "studentId", "==", user.uid)
      );
      const lessonsSnap = await getDocs(lessonsQuery);
      
      // Delete each lesson
      const deletePromises = lessonsSnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // 2. Delete user profile
      await deleteDoc(doc(db, "users", user.uid));

      // 3. Delete Firebase Auth user
      await user.delete();

      // 4. Call the onDeleteAccount callback
      onDeleteAccount();
    } catch (error) {
      console.error("Error deleting account:", error);
      setError("Neizdevās dzēst profilu. Lūdzu, mēģiniet vēlreiz.");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side - Profile and action buttons */}
            <div className="lg:col-span-1">
              {/* Profile Info Card */}
              <UserInfoCard 
                profile={profileData || createProfileFromUser(user, isTeacher)} 
                isEditable={true}
                onUpdate={(updatedProfile) => setProfileData(updatedProfile)}
              />
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={handleSignOut}
                  className="btn btn-secondary w-full"
                >
                  Iziet
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="btn btn-error w-full"
                >
                  Dzēst
                </button>
              </div>
            </div>

            {/* Right side - Bookings/Lessons */}
            <div className="lg:col-span-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="card-title">
                      {isTeacher ? 'Pieteiktās Stundas' : 'Manas Rezervācijas'}
                    </h2>
                    {isTeacher ? (
                      <button
                        onClick={() => setActiveTab('create-lesson')}
                        className="btn btn-primary"
                      >
                        Izveidot Stundu
                      </button>
                    ) : (
                      <Link
                        href="/#subjects"
                        className="btn btn-primary"
                      >
                        Pieteikties Stundai
                      </Link>
                    )}
                  </div>
                  {isTeacher ? (
                    <TeacherBookings teacherId={user.uid} />
                  ) : (
                    <StudentLessons studentId={user.uid} />
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'schedule':
        return <WorkSchedule teacherId={user.uid} />;
      case 'create-lesson':
        return <LessonForm onLessonCreated={() => setActiveTab('info')} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="space-y-6">
        {renderTabContent()}
      </div>

      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Dzēst Profilu"
        description="Vai tiešām vēlaties dzēst savu profilu? Šo darbību nevar atsaukt. Tiks dzēsti arī visi jūsu dati un nodarbības."
        actions={
          <>
            <button
              onClick={async () => {
                await handleDeleteAccount();
                setShowDeleteDialog(false);
              }}
              className="btn btn-error"
            >
              Dzēst
            </button>
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="btn btn-ghost"
            >
              Atcelt
            </button>
          </>
        }
      />

      <Dialog
        isOpen={!!error}
        onClose={() => setError(null)}
        title="Kļūda"
        description={error ?? ''}
        actions={
          <button onClick={() => setError(null)} className="btn">
            Aizvērt
          </button>
        }
      />
    </div>
  );
}