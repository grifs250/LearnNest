"use client";

import React from "react";

type Course = {
  id: string;
  name?: string;
  description?: string;
  hasVacancy?: boolean;
};

export default function CourseSections({
  subjects,
  languages,
  itCourses,
}: {
  subjects: Course[];
  languages: Course[];
  itCourses: Course[];
}) {
  return (
    <>
      {/* Mācību Priekšmeti */}
      <section id="subjects" className="py-16 px-8 bg-base-200">
        <h2 className="text-2xl font-bold mb-8 text-center">Mācību Priekšmeti</h2>
        <CourseGrid courses={subjects} />
      </section>

      {/* Valodu kursi */}
      <section id="languages" className="py-16 px-8 bg-base-100">
        <h2 className="text-2xl font-bold mb-8 text-center">Valodu Kursi</h2>
        <CourseGrid courses={languages} />
      </section>

      {/* IT Kursi */}
      <section id="it" className="py-16 px-8 bg-base-200">
        <h2 className="text-2xl font-bold mb-8 text-center">IT Kursi</h2>
        <CourseGrid courses={itCourses} />
      </section>
    </>
  );
}

function CourseGrid({ courses }: { courses: Course[] }) {
  if (!courses || courses.length === 0) {
    return <p className="text-center text-gray-500">Nav kursu</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {courses.map((course) => (
        <div key={course.id} className="card bg-base-100 shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-2">{course.name || "Nezināms"}</h3>
          <p className="text-sm text-gray-600">{course.description || "..."}</p>
        </div>
      ))}
    </div>
  );
}
