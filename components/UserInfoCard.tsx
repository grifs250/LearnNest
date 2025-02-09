"use client";
import { useState, useEffect } from "react";
import { ProfileData } from "@/types/profile";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { Dialog } from "./Dialog";
import { auth } from "@/lib/firebaseClient";

interface UserInfoCardProps {
  profile: {
    displayName: string;
    about?: string;
    isTeacher: boolean;
  };
  isEditable?: boolean;
}

export default function UserInfoCard({ profile, isEditable = false }: UserInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [about, setAbout] = useState(profile.about || '');

  const handleSave = async () => {
    if (!auth.currentUser) return;

    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        about
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">Par mani</h2>
          {isEditable && (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-ghost btn-sm"
            >
              {isEditing ? 'Atcelt' : 'Rediģēt'}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder={profile.isTeacher 
                ? "Pastāstiet par savu pieredzi un mācīšanas stilu..."
                : "Pastāstiet par sevi un saviem mācību mērķiem..."}
              className="textarea textarea-bordered w-full h-32"
            />
            <button 
              onClick={handleSave}
              className="btn btn-primary"
            >
              Saglabāt
            </button>
          </div>
        ) : (
          <div className="prose">
            {profile.about ? (
              <p>{profile.about}</p>
            ) : (
              <p className="text-base-content/50">
                {profile.isTeacher 
                  ? "Pastāstiet par savu pieredzi un mācīšanas stilu..."
                  : "Pastāstiet par sevi un saviem mācību mērķiem..."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 