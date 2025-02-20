"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Category, CourseSectionsProps, CATEGORY_NAMES } from "@/features/lessons/types";
import { useAvailableLessons } from "@/features/lessons/hooks";

export function CourseSections({ categories }: CourseSectionsProps) {
  const { availableSubjects, isLoading } = useAvailableLessons();

  if (isLoading) {
    return (
      <div className="py-16 px-8 flex justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="py-16 px-8 space-y-16">
      {categories.map((category) => (
        <section key={category.id} id={category.id} className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            {CATEGORY_NAMES[category.id] || category.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {category.subjects.map((subject) => (
              availableSubjects.has(subject.id) ? (
                <Link 
                  key={subject.id} 
                  href={`/lessons/${category.id}/${subject.id}`} 
                  className="card bg-base-100 shadow-lg hover:shadow-xl p-6 transition-all"
                >
                  <div className="card-body p-0">
                    <h4 className="font-semibold text-lg mb-2">{subject.name}</h4>
                    <div className="flex items-center text-success">
                      <span className="mr-2">✓</span>
                      <span>Pieejamas nodarbības</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div 
                  key={subject.id}
                  className="card bg-base-200 p-6 cursor-not-allowed border border-gray-200"
                >
                  <div className="card-body p-0">
                    <h4 className="font-semibold text-lg mb-2 text-gray-500">{subject.name}</h4>
                    <div className="flex items-center text-gray-400">
                      <span className="mr-2">ℹ️</span>
                      <span>Nav pieejamu nodarbību</span>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </section>
      ))}
    </div>
  );
} 