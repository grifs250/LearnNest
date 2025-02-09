"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import WorkSchedule from "@/components/WorkSchedule";
import Calendar from "@/components/Calendar";
import { Dialog } from "@/components/Dialog";

export default function CalendarPage() {
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setIsTeacher(!!userDoc.data().isTeacher);
        }
      } catch (err) {
        console.error("Error checking user:", err);
        setError("Neizdevās ielādēt datus");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Dialog
          isOpen={true}
          onClose={() => router.push('/')}
          title="Kļūda"
          description={error}
          actions={
            <button 
              onClick={() => router.push('/')}
              className="btn btn-primary"
            >
              Atgriezties sākumlapā
            </button>
          }
        />
      </div>
    );
  }

  if (!isTeacher) {
    router.push('/');
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Schedule */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Darba Grafiks</h2>
            <WorkSchedule 
              teacherId={auth.currentUser!.uid} 
              isEditable={true}
              onScheduleUpdate={() => {
                // Trigger calendar refresh
                window.location.reload();
              }}
            />
          </div>
        </div>

        {/* Calendar View */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Kalendārs</h2>
            <Calendar teacherId={auth.currentUser!.uid} />
          </div>
        </div>
      </div>
    </div>
  );
} 