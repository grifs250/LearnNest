"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function VacancyDetails() {
  const { vacancyId } = useParams();
  const router = useRouter();
  const [vacancy, setVacancy] = useState(null);

  useEffect(() => {
    async function fetchVacancy() {
      const docSnap = await getDoc(doc(db, "vacancies", vacancyId));
      if (docSnap.exists()) {
        setVacancy({ id: docSnap.id, ...docSnap.data() });
      }
    }
    fetchVacancy();
  }, [vacancyId]);

  async function handleBook() {
    const user = auth.currentUser;
    if (!user) {
      alert("Lūdzu, pieslēdzieties!");
      return;
    }

    await updateDoc(doc(db, "vacancies", vacancyId), { bookedBy: user.uid });
    alert("Jūs esat rezervējis šo nodarbību!");
    router.push("/profile");
  }

  if (!vacancy) return <p>Ielādē...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{vacancy.subject}</h1>
      <p>{vacancy.description}</p>
      <p>Pasniedzējs: {vacancy.teacherName}</p>
      <p>{vacancy.date} {vacancy.time}</p>
      {vacancy.bookedBy ? (
        <p className="text-red-500">Jau rezervēts</p>
      ) : (
        <button onClick={handleBook} className="btn btn-primary mt-2">
          Rezervēt
        </button>
      )}
    </div>
  );
}
