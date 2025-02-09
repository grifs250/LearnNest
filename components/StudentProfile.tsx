"use client";
import { User } from "firebase/auth";
import { ProfileData } from "@/types/profile";
import StudentInfoCard from "./StudentInfoCard";
import StudentLessons from "./StudentLessons";
import Link from "next/link";

interface StudentProfileProps {
  readonly user: User;
  readonly profile: ProfileData;
  readonly isEditable?: boolean;
}

export default function StudentProfile({ user, profile, isEditable = false }: StudentProfileProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Profile Info */}
      <div className="lg:col-span-1">
        <StudentInfoCard profile={profile} isEditable={isEditable} />
      </div>

      {/* Right Column - Bookings & Actions */}
      <div className="lg:col-span-2 space-y-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Mani Pieteikumi</h2>
            <StudentLessons studentId={user.uid} />
            <div className="mt-4">
              <Link 
                href="/"
                className="btn btn-primary"
              >
                Meklēt Jaunas Nodarbības
              </Link>
            </div>
          </div>
        </div>

        {/* Additional student-specific sections can be added here */}
      </div>
    </div>
  );
} 