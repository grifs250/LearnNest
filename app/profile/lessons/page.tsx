"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { LessonData } from "@/types/profile";
import { Dialog } from "@/components/Dialog";
import { Plus } from "lucide-react";
import LessonForm from "@/components/LessonForm";

function getStatusBadgeClass(status: string): string {
  if (status === 'accepted') return 'badge-success';
  if (status === 'rejected') return 'badge-error';
  return 'badge-warning';
}

function getStatusText(status: string): string {
  if (status === 'accepted') return 'Apstiprināts';
  if (status === 'rejected') return 'Atteikts';
  return 'Gaida apstiprinājumu';
}

export default function LessonsPage() {
  const router = useRouter();
  const [isTeacher, setIsTeacher] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewLessonDialog, setShowNewLessonDialog] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null);

  useEffect(() => {
    const loadUserAndLessons = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/auth');
        return;
      }

      setUserId(user.uid);
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const isTeacherRole = !!userDoc.data().isTeacher;
        setIsTeacher(isTeacherRole);
        await loadLessons(user.uid, isTeacherRole);
      }
    };

    loadUserAndLessons();
  }, [router]);

  const loadLessons = async (uid: string, isTeacherRole: boolean) => {
    try {
      const lessonsQuery = query(
        collection(db, "lessons"),
        where(isTeacherRole ? "teacherId" : "studentId", "==", uid)
      );
      const lessonsSnap = await getDocs(lessonsQuery);
      const lessonsList = lessonsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LessonData));
      setLessons(lessonsList);
    } catch (error) {
      console.error("Error loading lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (lessonId: string, status: 'accepted' | 'rejected') => {
    if (!userId) return;

    try {
      await updateDoc(doc(db, "lessons", lessonId), {
        status
      });
      await loadLessons(userId, isTeacher);
    } catch (error) {
      console.error("Error updating lesson status:", error);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">
    <span className="loading loading-spinner loading-lg"></span>
  </div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isTeacher ? "Manas Nodarbības" : "Manas Rezervācijas"}
        </h1>
        {isTeacher && (
          <button
            onClick={() => setShowNewLessonDialog(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Jauna Nodarbība
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{lesson.subject}</h2>
              <p className="text-sm text-muted-foreground">{lesson.description}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Datums:</span>
                  <span>{lesson.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Laiks:</span>
                  <span>{lesson.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    {isTeacher ? "Students:" : "Pasniedzējs:"}
                  </span>
                  <span>
                    {isTeacher ? lesson.studentName : lesson.teacherName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Statuss:</span>
                  <span className={`badge ${getStatusBadgeClass(lesson.status)}`}>
                    {getStatusText(lesson.status)}
                  </span>
                </div>
              </div>

              {isTeacher && lesson.status === 'pending' && (
                <div className="card-actions justify-end mt-4">
                  <button
                    onClick={() => handleStatusUpdate(lesson.id, 'rejected')}
                    className="btn btn-error btn-sm"
                  >
                    Atteikt
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(lesson.id, 'accepted')}
                    className="btn btn-success btn-sm"
                  >
                    Apstiprināt
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog
        isOpen={showNewLessonDialog}
        onClose={() => setShowNewLessonDialog(false)}
        title="Jauna Nodarbība"
        actions={
          <button
            onClick={() => setShowNewLessonDialog(false)}
            className="btn btn-ghost"
          >
            Aizvērt
          </button>
        }
      >
        <LessonForm
          onLessonCreated={() => {
            setShowNewLessonDialog(false);
            if (userId) loadLessons(userId, isTeacher);
          }}
        />
      </Dialog>
    </div>
  );
} 