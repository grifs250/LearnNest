"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs, query, where } from "firebase/firestore";

type Vacancy = {
  id: string;
  teacherName: string;
  timeslots: string[];
};

export default function VacanciesPage() {
  const { category, id } = useParams();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);

  useEffect(() => {
    async function fetchVacancies() {
      const q = query(collection(db, "vacancies"), where("courseId", "==", id));
      const snapshot = await getDocs(q);
      setVacancies(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Vacancy[]);
    }
    fetchVacancies();
  }, [id]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Pieejamie pasniedzēji</h2>
      {vacancies.map((v) => (
        <p key={v.id}>{v.teacherName}</p>
      ))}
    </div>
  );
}
