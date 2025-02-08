"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { fetchSubjects } from "@/lib/fetchSubjects";

interface Subject {
  id: string;
  name: string;
  category: string;
}

interface LessonFormProps {
  onLessonCreated?: () => void;  // Add callback prop
}

export default function LessonForm({ onLessonCreated }: LessonFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [lessonLength, setLessonLength] = useState(45); // Default 45 min
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSubjects() {
      const subjectsData = await fetchSubjects();
      subjectsData.sort((a, b) => a.name.localeCompare(b.name, 'lv'));
      setSubjects(subjectsData);
    }
    loadSubjects();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.currentUser) return alert("Jums ir jābūt pieteiktam!");

    const selectedSubject = subjects.find(s => s.id === subject);
    if (!selectedSubject) return alert("Lūdzu izvēlieties priekšmetu!");

    setSaving(true);
    try {
      await addDoc(collection(db, "lessons"), {
        subject: selectedSubject.name,
        subjectId: subject,
        description,
        lessonLength,
        teacherId: auth.currentUser.uid,
        teacherName: auth.currentUser.displayName,
        bookedTimes: {},
        category: selectedSubject.category || 'subjects'
      });

      alert("Nodarbība izveidota!");
      // Reset form
      setSubject("");
      setDescription("");
      setLessonLength(45);
      // Notify parent component
      onLessonCreated?.();
    } catch (error) {
      console.error("Kļūda veidojot nodarbību:", error);
      alert("Neizdevās izveidot nodarbību.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-lg rounded-lg max-w-lg mx-auto">
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">📚 Izveidot Nodarbību</h3>

      {/* Priekšmeta izvēle */}
      <label className="block text-gray-700 font-semibold mb-1">Priekšmets</label>
      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
        className="input input-bordered w-full mb-4"
      >
        <option value="">Izvēlieties priekšmetu</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {/* Apraksts */}
      <label className="block text-gray-700 font-semibold mb-1">Apraksts</label>
      <textarea
        placeholder="Aprakstiet nodarbību, piemēram, 'Algebras pamati - vienādojumi un nevienādības'"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="textarea textarea-bordered w-full mb-4"
      />

      {/* Nodarbības ilgums */}
      <label className="block text-gray-700 font-semibold mb-1">Nodarbības ilgums (minūtēs)</label>
      <input
        type="number"
        min="30"
        max="120"
        step="15"
        value={lessonLength}
        onChange={(e) => setLessonLength(Number(e.target.value))}
        className="input input-bordered w-full mb-4"
      />

      {/* Saglabāšanas poga */}
      <button
        type="submit"
        className={`btn w-full mt-4 ${saving ? "btn-disabled" : "btn-primary"}`}
        disabled={saving}
      >
        {saving ? "Saglabā..." : "✅ Izveidot Nodarbību"}
      </button>
    </form>
  );
}
