"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import WorkSchedule from "@/components/WorkSchedule"; 
import LessonForm from "@/components/LessonForm"; 

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
      const q = query(collection(db, "lessons"), where("teacherId", "==", user.uid));
      const snapshot = await getDocs(q);
      setMyLessons(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Lesson[]);

      const q2 = query(collection(db, "lessons"), where("bookedBy", "==", user.uid));
      const snapshot2 = await getDocs(q2);
      setBookedLessons(snapshot2.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Lesson[]);
    };

    fetchLessons();
  }, [user]);

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

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-base-100 shadow">
      <h1 className="text-2xl font-bold mb-4">Profils</h1>

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
        <label className="label">Loma</label>
        <input
          type="text"
          className="input input-bordered"
          value={isTeacher ? "Pasniedzējs" : "Skolēns"}
          disabled
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

      <button onClick={handleSaveProfile} className="btn btn-primary mt-4" disabled={saving}>
        {saving ? "Saglabā..." : "Saglabāt"}
      </button>

      <button onClick={handleLogout} className="btn btn-error mt-4">
        Izrakstīties
      </button>

      {isTeacher && (
        <>
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Darba laika iestatījumi</h2>
            <WorkSchedule />
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Jūsu nodarbības</h2>
            <LessonForm />
            <ul className="mt-4">
            {myLessons.map((lesson) => (
              <li key={lesson.id} className="p-2 border-b">
                <p>
                  <strong>{lesson.subject}</strong> -{" "}
                  {lesson.availableTimes && lesson.availableTimes.length > 0
                    ? lesson.availableTimes.join(", ")
                    : "Nav pieejamu laiku"} {/* ✅ Show a message if times are missing */}
                </p>
                {lesson.bookedBy ? (
                  <p className="text-green-500">Student signed up</p>
                ) : (
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="btn btn-error btn-sm mt-2"
                  >
                    Dzēst nodarbību
                  </button>
                )}
              </li>
            ))}
            </ul>
          </div>
        </>
      )}

      {!isTeacher && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Jūsu rezervētās nodarbības</h2>
          <ul className="mt-4">
            {bookedLessons.map((lesson) => (
              <li key={lesson.id} className="p-2 border-b">
                {lesson.subject} - {lesson.availableTimes.join(", ")} ({lesson.teacherName})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
