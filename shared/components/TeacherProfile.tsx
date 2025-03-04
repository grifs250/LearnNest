"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserProfile } from "@/types/database";

export interface TeacherProfileProps {
  teacher: UserProfile;
}

const TeacherProfile = ({ teacher }: TeacherProfileProps) => {
  const [activeTab, setActiveTab] = useState("about");

  // Extract metadata with defaults
  const experienceYears = teacher.teacher_experience_years || 0;
  const specializations = teacher.teacher_specializations || [];
  const education = teacher.teacher_education || [];
  const certificates = teacher.teacher_certificates || [];
  const hourlyRate = teacher.teacher_rate || 0;
  const rating = teacher.rating || 0;
  const totalReviews = teacher.total_reviews || 0;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-base-100 shadow-xl rounded-lg overflow-hidden">
        {/* Teacher Header */}
        <div className="p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="avatar">
              <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                {teacher.avatar_url ? (
                  <Image
                    src={teacher.avatar_url}
                    alt={teacher.full_name}
                    width={128}
                    height={128}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-accent flex items-center justify-center text-2xl font-bold text-accent-content">
                    {teacher.full_name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-grow">
            <h1 className="text-2xl font-bold">{teacher.full_name}</h1>
            <div className="flex items-center mt-2 mb-4">
              <div className="badge badge-primary mr-4">
                {experienceYears} gadi pieredze
              </div>
              <div className="rating rating-sm">
                {[1, 2, 3, 4, 5].map((star) => (
                  <input
                    key={star}
                    type="radio"
                    name="rating-2"
                    className={`mask mask-star-2 ${
                      star <= Math.round(rating) ? "bg-warning" : "bg-gray-300"
                    }`}
                    disabled
                    checked={star === Math.round(rating)}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  ({totalReviews})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-bold">€{hourlyRate.toFixed(2)}</span>
              <span className="text-sm">/ stunda</span>
            </div>
            <p className="text-gray-700">{teacher.page_description}</p>
          </div>

          <div className="flex-shrink-0 flex flex-col gap-2">
            <Link
              href={`/lessons/book/${teacher.url_slug}`}
              className="btn btn-primary"
            >
              Rezervēt stundu
            </Link>
            <Link
              href={`/conversations/new?teacherId=${teacher.user_id}`}
              className="btn btn-outline"
            >
              Sazināties
            </Link>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-t border-b">
          <div className="tabs tabs-bordered w-full">
            <button
              className={`tab tab-lg ${activeTab === "about" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("about")}
            >
              Par pasniedzēju
            </button>
            <button
              className={`tab tab-lg ${activeTab === "lessons" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("lessons")}
            >
              Nodarbības
            </button>
            <button
              className={`tab tab-lg ${activeTab === "reviews" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Atsauksmes
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* About Tab */}
          {activeTab === "about" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Biogrāfija</h2>
              <p className="mb-6 whitespace-pre-line">{teacher.teacher_bio || "Nav norādīta biogrāfija."}</p>

              {specializations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Specializācijas</h3>
                  <div className="flex flex-wrap gap-2">
                    {specializations.map((spec, i) => (
                      <div key={i} className="badge badge-outline">
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {education.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Izglītība</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {education.map((edu, i) => (
                      <li key={i}>{edu}</li>
                    ))}
                  </ul>
                </div>
              )}

              {certificates.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Sertifikāti</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {certificates.map((cert, i) => (
                      <li key={i}>{cert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Lessons Tab */}
          {activeTab === "lessons" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Piedāvātās nodarbības</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Placeholder for lessons - this will be implemented separately */}
                <div className="card bg-base-200">
                  <div className="card-body">
                    <p className="text-center text-gray-500">
                      Nodarbību saraksts tiek ielādēts...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Audzēkņu atsauksmes</h2>
              {totalReviews > 0 ? (
                <div className="space-y-4">
                  {/* Placeholder for reviews - this will be implemented separately */}
                  <div className="bg-base-200 p-4 rounded-lg">
                    <p className="text-center text-gray-500">
                      Atsauksmes tiek ielādētas...
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Pagaidām nav nevienas atsauksmes.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile; 