"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

export default function VacanciesPage() {
  const { category, courseId } = useParams();
  const [vacancies, setVacancies] = useState([]);

  useEffect(() => {
    async function fetchVacancies() {
      const q = query(collection(db, "vacancies"), where("courseId", "==", courseId));
      const querySnapshot = await getDocs(q);
      setVacancies(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
    fetchVacancies();
  }, [courseId]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Pieejamās nodarbības</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {vacancies.map((vacancy) => (
          <Link key={vacancy.id} href={`/vacancy/${vacancy.id}`} className="card bg-white p-4 shadow-md">
            <h3 className="text-lg font-bold">{vacancy.subject}</h3>
            <p>{vacancy.description}</p>
            <p className="text-sm">Pasniedzējs: {vacancy.teacherName}</p>
            <p>{vacancy.date} {vacancy.time}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
