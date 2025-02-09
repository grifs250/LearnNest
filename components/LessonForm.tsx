"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { collection, addDoc, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { fetchSubjects } from "@/lib/fetchSubjects";
import { Clock, Plus, Trash2 } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  category: string;
}

interface Lesson {
  id: string;
  subject: string;
  description: string;
  lessonLength: number;
  price: number;
  status: 'active' | 'inactive';
}

interface LessonFormProps {
  onLessonCreated?: () => void;
}

export default function LessonForm({ onLessonCreated }: LessonFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [lessonLength, setLessonLength] = useState(45);
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [myLessons, setMyLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [subjectsData, lessonsSnapshot] = await Promise.all([
        fetchSubjects(),
        getDocs(query(
          collection(db, "lessons"),
          where("teacherId", "==", auth.currentUser?.uid)
        ))
      ]);

      setSubjects(subjectsData.sort((a, b) => a.name.localeCompare(b.name, 'lv')));
      setMyLessons(lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Lesson)));
      setLoading(false);
    }

    if (auth.currentUser) {
      loadData();
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.currentUser) return alert("Jums ir jābūt pieteiktam!");

    const selectedSubject = subjects.find(s => s.id === subject);
    if (!selectedSubject) return alert("Lūdzu izvēlieties priekšmetu!");

    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "lessons"), {
        subject: selectedSubject.name,
        subjectId: subject,
        description,
        lessonLength,
        price: Number(price),
        teacherId: auth.currentUser.uid,
        teacherName: auth.currentUser.displayName,
        status: 'active',
        createdAt: new Date(),
        category: selectedSubject.category || 'subjects'
      });

      setMyLessons(prev => [...prev, {
        id: docRef.id,
        subject: selectedSubject.name,
        description,
        lessonLength,
        price: Number(price),
        status: 'active'
      }]);

      alert("Nodarbība izveidota!");
      setSubject("");
      setDescription("");
      setLessonLength(45);
      setPrice("");
      onLessonCreated?.();
    } catch (error) {
      console.error("Kļūda veidojot nodarbību:", error);
      alert("Neizdevās izveidot nodarbību.");
    }
    setSaving(false);
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm("Vai tiešām vēlaties dzēst šo nodarbību?")) return;

    try {
      await deleteDoc(doc(db, "lessons", lessonId));
      setMyLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
      alert("Nodarbība dzēsta!");
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("Neizdevās dzēst nodarbību.");
    }
  }

  if (loading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text">Priekšmets</span>
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="select select-bordered w-full"
          >
            <option value="">Izvēlieties priekšmetu</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">
            <span className="label-text">Apraksts</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="textarea textarea-bordered w-full"
            placeholder="Aprakstiet nodarbību..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Nodarbības ilgums (minūtēs)</span>
            </label>
            <input
              type="number"
              min="30"
              max="120"
              step="15"
              value={lessonLength}
              onChange={(e) => setLessonLength(Number(e.target.value))}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Cena (€)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="input input-bordered w-full"
              placeholder="15.00"
            />
          </div>
        </div>

        <button
          type="submit"
          className={`btn btn-primary w-full ${saving ? "loading" : ""}`}
          disabled={saving}
        >
          {saving ? "Saglabā..." : "Izveidot nodarbību"}
        </button>
      </form>

      <div className="divider">Manas nodarbības</div>

      <div className="space-y-4">
        {myLessons.length === 0 ? (
          <div className="text-center text-gray-500">
            Nav izveidotu nodarbību
          </div>
        ) : (
          myLessons.map((lesson) => (
            <div key={lesson.id} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{lesson.subject}</h3>
                    <p className="text-sm text-gray-600">{lesson.description}</p>
                    <div className="mt-2 space-x-2">
                      <span className="badge badge-outline">
                        {lesson.lessonLength} min
                      </span>
                      <span className="badge badge-outline">
                        {lesson.price}€
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="btn btn-ghost btn-sm text-error"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
