"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import WorkSchedule from "@/components/WorkSchedule"; 
import LessonForm from "@/components/LessonForm"; 
import StudentBookings from "@/components/StudentBookings";
import TeacherBookings from "@/components/TeacherBookings";
import StudentLessons from "@/components/StudentLessons";
import CreateLessonModal from "@/components/CreateLessonModal";

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchLessons = useCallback(async () => {
    if (!user?.uid) return;
    
    const q = query(
      collection(db, "lessons"),
      where("teacherId", "==", user.uid)
    );
    const snapshot = await getDocs(q);
    setMyLessons(snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Lesson)));
  }, [user?.uid]);

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

    fetchLessons();
  }, [user, fetchLessons]);

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

  async function handleEditLesson(lesson: Lesson) {
    // For now, just show an alert that this feature is coming soon
    alert("Nodarbības rediģēšana būs pieejama drīzumā!");
    
    // TODO: Implement lesson editing
    // This could open a modal or navigate to an edit page
    // const updatedLesson = {
    //   ...lesson,
    //   subject: "Updated subject",
    //   description: "Updated description",
    //   lessonLength: 60
    // };
    // 
    // await updateDoc(doc(db, "lessons", lesson.id), updatedLesson);
    // await fetchLessons(); // Refresh the lessons list
  }

  if (loading) {
    return <div className="p-6 text-center">Ielādē...</div>;
  }

  if (!user) return <div>Loading...</div>;

  return (
    <main className="min-h-screen bg-base-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          {isTeacher ? "Pasniedzēja profils" : "Skolēna profils"}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Profila informācija</h2>
                {error && <p className="text-error">{error}</p>}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Vārds</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Apraksts</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Aprakstiet sevi..."
                  />
                </div>
                <div className="card-actions justify-end mt-6">
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-error btn-ghost hover:btn-error"
                  >
                    Izrakstīties
                  </button>
                  <button 
                    onClick={handleSaveProfile} 
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Saglabā..." : "Saglabāt"}
                  </button>
                </div>
              </div>
            </div>

            {/* Work Schedule - Only for teachers */}
            {isTeacher && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4">Darba grafiks</h2>
                  <WorkSchedule />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Lessons & Bookings */}
          <div className="lg:col-span-2 space-y-6">
            {isTeacher ? (
              <>
                {/* Teacher's Lessons */}
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex justify-between items-center">
                      <h2 className="card-title text-xl">Jūsu nodarbības</h2>
                      <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn btn-primary btn-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Pievienot
                      </button>
                    </div>

                    <div className="mt-6 space-y-4">
                      {myLessons.map((lesson) => (
                        <div key={lesson.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                          <div className="card-body">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="card-title text-lg mb-2">
                                  <span className="mr-2">📚</span>
                                  {lesson.subject}
                                </h3>
                                <div className="space-y-2 text-gray-600">
                                  <p className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {lesson.lessonLength} minūtes
                                  </p>
                                  {lesson.description && (
                                    <p className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  className="btn btn-error btn-sm"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                                {/* Remove or comment out the edit button until implemented
                                <button
                                  onClick={() => handleEditLesson(lesson)}
                                  className="btn btn-primary btn-sm"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                */}
                              </div>
                            </div>

                            {/* Show booking stats if any */}
                            {lesson.bookedTimes && Object.keys(lesson.bookedTimes).length > 0 && (
                              <div className="mt-4 pt-4 border-t border-base-300">
                                <h4 className="font-medium mb-2">Rezervācijas:</h4>
                                <div className="flex gap-4">
                                  <div className="badge badge-warning">
                                    Gaida: {Object.values(lesson.bookedTimes).filter(b => b?.status === 'pending').length}
                                  </div>
                                  <div className="badge badge-success">
                                    Apstiprinātas: {Object.values(lesson.bookedTimes).filter(b => b?.status === 'accepted').length}
                                  </div>
                                  <div className="badge badge-error">
                                    Noraidītas: {Object.values(lesson.bookedTimes).filter(b => b?.status === 'rejected').length}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Teacher's Bookings */}
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title text-xl mb-4">Pieteikumi uz nodarbībām</h2>
                    <TeacherBookings teacherId={user.uid} />
                  </div>
                </div>
              </>
            ) : (
              /* Student's Bookings */
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4">Manas rezervētās nodarbības</h2>
                  <StudentLessons studentId={user.uid} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Lesson Modal */}
      <CreateLessonModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onLessonCreated={fetchLessons}
      />
    </main>
  );
}
