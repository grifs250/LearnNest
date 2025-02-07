"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebaseClient";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

type Vacancy = {
  id: string;
  subject: string;
  description: string;
  teacherName: string;
  date: string;
  time: string;
  bookedBy?: string;
};

export default function AvailableVacancies() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);

  useEffect(() => {
    async function fetchVacancies() {
      const querySnapshot = await getDocs(collection(db, "vacancies"));
      const vacancyList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Vacancy[];
      setVacancies(vacancyList);
    }
    fetchVacancies();
  }, []);

  async function handleBook(vacancyId: string) {
    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in first!");
      return;
    }

    const vacancyRef = doc(db, "vacancies", vacancyId);
    await updateDoc(vacancyRef, { bookedBy: user.uid });

    alert("You have booked this lesson!");
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Pieejamās Nodarbības</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {vacancies.length === 0 ? (
          <p className="text-center text-gray-500">Nav pieejamu nodarbību</p>
        ) : (
          vacancies.map((v) => (
            <div key={v.id} className="card bg-white p-4 shadow-md">
              <h3 className="text-lg font-bold">{v.subject}</h3>
              <p>{v.description}</p>
              <p className="text-sm">Pasniedzējs: {v.teacherName}</p>
              <p>{v.date} {v.time}</p>
              {v.bookedBy ? (
                <p className="text-red-500">Jau rezervēts</p>
              ) : (
                <button onClick={() => handleBook(v.id)} className="btn btn-primary mt-2">
                  Rezervēt
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

