"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import ProfileSidebar from "./ProfileSidebar";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth?mode=login');
        return;
      }
      setUserId(user.uid);
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setIsTeacher(!!userDoc.data().isTeacher);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!userId) return null;

  return (
    <div className="flex min-h-screen bg-base-100">
      <ProfileSidebar userId={userId} isTeacher={isTeacher} />
      
      {/* Main Content */}
      <div className="flex-1 ml-[72px] mt-[64px]">
        <div className="max-w-5xl mx-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
} 