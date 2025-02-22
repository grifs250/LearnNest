"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/db";
import { fetchSubjects } from "@/lib/fetchSubjects";
import { Subject } from "@/features/lessons/types";

export function LessonForm() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [lessonLength, setLessonLength] = useState(45); // Default 45 min
  const [saving, setSaving] = useState(false);
  const [price, setPrice] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*');

        if (error) throw error;

        setSubjects(data);
      } catch (err) {
        console.error('Error fetching subjects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        category: selectedSubject.categoryId || 'subjects',
        price
      });

      alert("Nodarbība izveidota!");
      // Reset form
      setSubject("");
      setDescription("");
      setLessonLength(45);
      setPrice('');
    } catch (error) {
      console.error("Kļūda veidojot nodarbību:", error);
      alert("Neizdevās izveidot nodarbību.");
    }
    setSaving(false);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-lg rounded-lg max-w-lg mx-auto space-y-4">
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

      <div className="form-control">
        <label className="block text-gray-700 font-semibold mb-1">
          Cena (EUR)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
          className="input input-bordered w-full"
          placeholder="15"
          required
        />
      </div>

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
