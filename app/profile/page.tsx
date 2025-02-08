"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import WorkSchedule from "@/components/WorkSchedule"; 
import LessonForm from "@/components/LessonForm"; 
import StudentBookings from "@/components/StudentBookings";
import TeacherBookings from "@/components/TeacherBookings";

type Lesson = {
  id: string;
  subject: string;
  description: string;
  teacherName: string;
  availableTimes: string[];
  bookedBy?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [myLessons, setMyLessons] = useState<Lesson[]>([]);
  const [bookedLessons, setBookedLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/auth/sign-in");
        return;
      }
      setUser(u);

      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) {
        const data = snap.data();
        setDisplayName(data.displayName || "");
        setDescription(data.description || "");
        setIsTeacher(!!data.isTeacher);
      }

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const fetchLessons = async () => {
      if (isTeacher) {
        const q = query(collection(db, "lessons"), where("teacherId", "==", user.uid));
        const snapshot = await getDocs(q);
        setMyLessons(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Lesson[]);
      }
    };

    fetchLessons();
  }, [user, isTeacher]);

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  async function handleSaveProfile() {
    if (!user) return;
    setSaving(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        description,
      });

      await updateProfile(user, { displayName });
      alert("Profils saglabāts!");
    } catch (err: any) {
      setError("Kļūda saglabājot datus.");
    }

    setSaving(false);
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm("Vai tiešām vēlaties dzēst šo nodarbību?")) return;
    await deleteDoc(doc(db, "lessons", lessonId));
    setMyLessons(myLessons.filter((lesson) => lesson.id !== lessonId));
    alert("Nodarbība dzēsta!");
  }

  if (loading) {
    return <div className="p-6 text-center">Ielādē...</div>;
  }

  if (!user) return <div>Loading...</div>;

  return (
    <main className="p-8">
      {isTeacher ? (
        <>
          <h1 className="text-2xl font-bold mb-6">Pasniedzēja profils</h1>
          
          <div className="flex flex-col gap-8 max-w-xl mx-auto">
            <div className="bg-base-100 shadow p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Profila informācija</h2>
              {error && <p className="text-red-500">{error}</p>}
              <div className="form-control mb-4">
                <label className="label">Vārds</label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">Apraksts</label>
                <textarea
                  className="textarea textarea-bordered"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Aprakstiet sevi..."
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button onClick={handleSaveProfile} className="btn btn-primary flex-1" disabled={saving}>
                  {saving ? "Saglabā..." : "Saglabāt"}
                </button>
                <button onClick={handleLogout} className="btn btn-error flex-1">
                  Izrakstīties
                </button>
              </div>
            </div>

            <div className="bg-base-100 shadow p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Darba grafiks</h2>
              <WorkSchedule />
            </div>

            <div className="bg-base-100 shadow p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Jūsu nodarbības</h2>
              <LessonForm />
              <div className="mt-4 space-y-4">
                {myLessons.map((lesson) => (
                  <div key={lesson.id} className="card bg-base-100 shadow p-4">
                    <h3 className="font-semibold">{lesson.subject}</h3>
                    <p className="text-sm">{lesson.description}</p>
                    {lesson.bookedBy ? (
                      <p className="text-success mt-2">Rezervēta</p>
                    ) : (
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="btn btn-error btn-sm mt-2"
                      >
                        Dzēst nodarbību
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-base-100 shadow p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Pieteikumi uz nodarbībām</h2>
              <TeacherBookings teacherId={user.uid} />
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-6">Skolēna profils</h1>
          
          <div className="flex flex-col gap-8 max-w-xl mx-auto">
            <div className="bg-base-100 shadow p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Profila informācija</h2>
              {error && <p className="text-red-500">{error}</p>}
              <div className="form-control mb-4">
                <label className="label">Vārds</label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">Apraksts</label>
                <textarea
                  className="textarea textarea-bordered"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Aprakstiet sevi..."
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button onClick={handleSaveProfile} className="btn btn-primary flex-1" disabled={saving}>
                  {saving ? "Saglabā..." : "Saglabāt"}
                </button>
                <button onClick={handleLogout} className="btn btn-error flex-1">
                  Izrakstīties
                </button>
              </div>
            </div>

            <div className="bg-base-100 shadow p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Manas rezervētās nodarbības</h2>
              <StudentBookings userId={user.uid} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
