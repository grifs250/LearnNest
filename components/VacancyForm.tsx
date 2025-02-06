"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { auth, db } from "@/lib/firebaseClient";
import { doc, setDoc } from "firebase/firestore";

type CalendarValue = Date | [Date, Date] | null;

export default function VacancyForm() {
  const [subject, setSubject] = useState("Matemātika");
  const [description, setDescription] = useState("");
  const [selectedDates, setSelectedDates] = useState<[Date, Date] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      alert("You need to be logged in to create a vacancy!");
      setLoading(false);
      return;
    }

    if (!selectedDates) {
      alert("Lūdzu izvēlieties pieejamos laikus!");
      setLoading(false);
      return;
    }

    const [start, end] = selectedDates;
    const vacancyRef = doc(db, "vacancies", `${user.uid}_${Date.now()}`);

    await setDoc(vacancyRef, {
      subject,
      description,
      timeslots: [start.toISOString(), end.toISOString()],
      teacherId: user.uid,
      teacherName: user.displayName || "Unknown",
    });

    alert("Vacancy created successfully!");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card bg-base-200 p-4">
      <h3 className="font-bold text-lg mb-2">Izveidot vakanci</h3>

      <div className="form-control">
        <label className="label font-semibold">Priekšmets</label>
        <select className="select select-bordered" value={subject} onChange={(e) => setSubject(e.target.value)}>
          {["Matemātika", "Ķīmija", "Bioloģija", "Fizika"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <label className="label font-semibold">Apraksts</label>
        <textarea className="textarea textarea-bordered" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="form-control">
        <label className="label font-semibold">Izvēlieties pieejamos laikus</label>
        <Calendar
          onChange={(value) => setSelectedDates(value as [Date, Date] | null)}
          value={selectedDates}
          selectRange // 🔹 Allows selecting a date range
        />
      </div>

      <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
        {loading ? "Saglabā..." : "Izveidot"}
      </button>
    </form>
  );
}
