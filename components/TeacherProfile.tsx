"use client";
import { User } from "firebase/auth";
import { ProfileData } from "@/types/profile";
import WorkSchedule from "./WorkSchedule";
import TeacherBookings from "./TeacherBookings";
import LessonForm from "./LessonForm";
import PaymentForm from "./PaymentForm";
import TeacherInfoCard from "./TeacherInfoCard";

interface TeacherProfileProps {
  user: User;
  profile: ProfileData;
  isEditable?: boolean;
}

export default function TeacherProfile({ user, profile, isEditable = false }: TeacherProfileProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Profile Info */}
      <div className="lg:col-span-1">
        <TeacherInfoCard profile={profile} isEditable={isEditable} />
      </div>

      {/* Right Column - Schedule, Lessons & Bookings */}
      <div className="lg:col-span-2 space-y-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Darba grafiks</h2>
            <WorkSchedule teacherId={user.uid} isEditable={isEditable} />
          </div>
        </div>

        {isEditable && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Nodarbības</h2>
              <LessonForm onLessonCreated={() => {}} />
            </div>
          </div>
        )}

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Pieteikumi uz nodarbībām</h2>
            <TeacherBookings teacherId={user.uid} />
          </div>
        </div>

        {isEditable && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Izveidot jaunu maksājumu</h2>
              <div className="mt-4">
                <PaymentForm
                  lessonId="manual"
                  lessonTitle="Individuāla nodarbība"
                  teacherId={user.uid}
                  teacherName={profile.displayName}
                  studentId=""
                  studentName=""
                  amount={0}
                  onPaymentCreated={() => {}}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 