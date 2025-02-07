"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const weekdays = ["Pirmdiena", "Otrdiena", "Trešdiena", "Ceturtdiena", "Piektdiena", "Sestdiena", "Svētdiena"];

export default function WorkSchedule() {
  const [workHours, setWorkHours] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchWorkHours() {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setWorkHours(snap.data().workHours || {});
      }
      setLoading(false);
    }

    fetchWorkHours();
  }, []);

  async function handleSave() {
    const user = auth.currentUser;
    if (!user) return alert("Jums ir jābūt pieteiktam!");

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { workHours });
      alert("Darba laiks atjaunināts!");
    } catch (error) {
      console.error("Kļūda saglabājot datus:", error);
      alert("Neizdevās saglabāt izmaiņas.");
    }
    setSaving(false);
  }

  function handleTimeChange(day: string, value: string) {
    const newHours = value.split(", ").map((t) => t.trim());
    setWorkHours((prev) => ({
      ...prev,
      [day]: newHours,
    }));
  }

  if (loading) {
    return <div className="p-6 bg-white shadow animate-pulse">Ielādē darba grafiku...</div>;
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-center">Darba grafiks</h2>
      <p className="text-gray-500 text-center mb-6">Iestatiet savas pieejamās stundas katrai dienai.</p>

      {weekdays.map((day) => (
        <div key={day} className="mb-4">
          <label className="block font-semibold text-gray-700 mb-1">{day}</label>
          <input
            type="text"
            placeholder="Piemērs: 08:00-10:00, 14:00-16:00"
            value={workHours[day]?.join(", ") || ""}
            onChange={(e) => handleTimeChange(day, e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
      ))}

      <button
        className={`btn w-full mt-4 ${saving ? "btn-disabled" : "btn-primary"}`}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saglabā..." : "Saglabāt izmaiņas"}
      </button>
    </div>
  );
}
