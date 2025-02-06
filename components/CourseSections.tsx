"use client";

import React from "react";
import Link from "next/link";

type Course = {
  id: string;
  name?: string;
  description?: string;
  hasVacancy?: boolean;
};

interface CourseSectionsProps {
  subjects: Course[];
  languages: Course[];
  itCourses: Course[];
}

export default function CourseSections({ subjects, languages, itCourses }: CourseSectionsProps) {
  return (
    <>
      {/* Mācību Priekšmeti */}
      <CourseCategory title="Mācību Priekšmeti" courses={subjects} category="subjects" />

      {/* Valodu kursi */}
      <CourseCategory title="Valodu Kursi" courses={languages} category="languages" />

      {/* IT Kursi */}
      <CourseCategory title="IT Kursi" courses={itCourses} category="itCourses" />
    </>
  );
}

function CourseCategory({ title, courses, category }: { title: string; courses: Course[]; category: string }) {
  return (
    <section id={category} className="py-16 px-8 bg-base-100">
      <h2 className="text-2xl font-bold mb-8 text-center">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Link
              key={course.id}
              href={`/vacancies/${category}/${course.id}`} // Dynamic link
              className="card bg-base-100 shadow p-6 hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2">{course.name || "Nezināms"}</h3>
              <p className="text-sm text-gray-600">{course.description || "..."}</p>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-500">Nav pieejamu kursu</p>
        )}
      </div>
    </section>
  );
}
