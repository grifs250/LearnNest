// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth/sign-in");
        return;
      }
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setIsTeacher(!!snap.data().isTeacher);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <main className="p-8">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      {isTeacher ? <TeacherDashboard /> : <StudentDashboard />}
    </main>
  );
}

function TeacherDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Skolotāja Vadības Panelis</h2>
      <p>Šeit var izveidot vakances, pārvaldīt grafiku, pieņemt rezervācijas.</p>
    </div>
  );
}

function StudentDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Skolēna Vadības Panelis</h2>
      <p>Šeit var pieteikties uz nodarbībām, apskatīt rezervācijas, u.c.</p>
    </div>
  );
}
