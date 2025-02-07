"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function VacancyForm() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const categoryList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name as string, // Explicitly cast to string
        }));
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    fetchCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in!");

    try {
      await addDoc(collection(db, "vacancies"), {
        subject,
        description,
        date,
        time,
        teacherId: user.uid,
        teacherName: user.displayName,
        bookedBy: null,
      });

      alert("Vacancy created!");
      setSubject("");
      setDescription("");
      setDate("");
      setTime("");
    } catch (error) {
      console.error("Error creating vacancy:", error);
      alert("Failed to create vacancy.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow">
      <h3 className="text-lg font-bold">Izveidot vakanci</h3>
      <select value={subject} onChange={(e) => setSubject(e.target.value)} required>
        <option value="">Izvēlieties priekšmetu</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <input type="text" placeholder="Apraksts" value={description} onChange={(e) => setDescription(e.target.value)} required />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
      <button type="submit" className="btn btn-primary mt-2">Izveidot</button>
    </form>
  );
}
