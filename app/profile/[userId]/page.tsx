"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { ProfileData } from "@/types/profile";
import TeacherProfile from "@/components/TeacherProfile";
import StudentProfile from "@/components/StudentProfile";
import PublicProfile from "@/components/PublicProfile";

interface ProfilePageProps {
  readonly params: Promise<{ userId: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = use(params);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const isOwnProfile = auth.currentUser?.uid === resolvedParams.userId;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) {
        router.push('/auth');
        return;
      }

      try {
        const docRef = doc(db, "users", resolvedParams.userId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          setError("Profile not found");
          setLoading(false);
          return;
        }

        setProfile({
          ...docSnap.data() as ProfileData,
          uid: resolvedParams.userId
        });
      } catch (err) {
        setError("Error loading profile");
        console.error(err);
      }
      setLoading(false);
    }

    if (resolvedParams.userId) {
      loadProfile();
    }
  }, [resolvedParams.userId, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-error">{error || "Profile not found"}</h2>
      </div>
    );
  }

  if (!isOwnProfile) {
    return <PublicProfile userId={resolvedParams.userId} />;
  }

  return profile.isTeacher ? (
    <TeacherProfile 
      user={currentUser!} 
      profile={profile} 
      isEditable={isOwnProfile} 
    />
  ) : (
    <StudentProfile 
      user={currentUser!} 
      profile={profile} 
      isEditable={isOwnProfile} 
    />
  );
} 