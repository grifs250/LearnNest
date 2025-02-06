"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

type Vacancy = {
  id: string;
  subject: string;
  description: string;
  teacherName: string;
  timeslots: string[];
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
              <div className="mt-2">
                {v.timeslots.map((slot, index) => (
                  <button key={index} className="btn btn-outline btn-sm m-1">
                    {new Date(slot).toLocaleString()}
                  </button>
                ))}
              </div>
              <Link href={`/booking?vacancyId=${v.id}`} className="btn btn-primary mt-2">
                Rezervēt nodarbību
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
