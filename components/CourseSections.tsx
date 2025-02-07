"use client";
import Link from "next/link";

type Subjects = {
  id: string;
  name: string;
};

interface CourseSectionsProps {
  subjects: Subjects[];
}

export default function CourseSections({ subjects }: CourseSectionsProps) {
  return (
    <section className="py-16 px-8">
      <h2 className="text-2xl font-bold text-center">Priekšmeti</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Link key={subject.id} href={`/vacancies/${subject.id}`} className="card p-4 shadow">
            <h3 className="font-semibold">{subject.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
