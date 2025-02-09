"use client";
import { useState, useEffect } from "react";
import { ProfileData } from "@/types/profile";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { Dialog } from "./Dialog";

interface TeacherInfoCardProps {
  profile: ProfileData;
  isEditable?: boolean;
}

export default function TeacherInfoCard({ profile, isEditable = false }: TeacherInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    ...profile,
    displayName: profile.displayName || '',
    description: profile.description || '',
    education: profile.education || '',
    experience: profile.experience || '',
    subjects: profile.subjects || [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditedProfile({
        ...profile,
        uid: profile.uid,
        displayName: profile.displayName || '',
        description: profile.description || '',
        education: profile.education || '',
        experience: profile.experience || '',
        subjects: profile.subjects || [],
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!isEditable) {
      setIsEditing(false);
    }
  }, [isEditable]);

  const handleSave = async () => {
    console.log("Saving profile with UID:", profile.uid);

    if (!profile.uid) {
      console.error("No UID found in profile");
      setError("Neizdevās saglabāt profilu - nav atrasts lietotāja ID");
      setShowErrorDialog(true);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const userRef = doc(db, "users", profile.uid);
      
      const updateData = {
        displayName: editedProfile.displayName,
        description: editedProfile.description || null,
        education: editedProfile.education || null,
        experience: editedProfile.experience || null,
        subjects: editedProfile.subjects || [],
        isTeacher: true,
        role: 'teacher' as const,
        email: profile.email,
        uid: profile.uid
      };

      await updateDoc(userRef, updateData);
      setIsEditing(false);
      
      alert("Profils veiksmīgi saglabāts!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Neizdevās saglabāt profilu. Lūdzu, mēģiniet vēlreiz.");
      setShowErrorDialog(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {isEditing ? (
            <input
              type="text"
              className="input input-bordered text-2xl font-bold"
              value={editedProfile.displayName}
              onChange={(e) => setEditedProfile({
                ...editedProfile,
                displayName: e.target.value
              })}
              placeholder={profile.displayName || 'Jūsu vārds'}
            />
          ) : (
            <h2 className="card-title text-2xl">
              {profile.displayName}
              <span className="badge badge-secondary">Pasniedzējs</span>
            </h2>
          )}
          
          {isEditing ? (
            <textarea
              className="textarea textarea-bordered mt-2"
              value={editedProfile.description}
              onChange={(e) => setEditedProfile({
                ...editedProfile,
                description: e.target.value
              })}
              placeholder={profile.description || "Aprakstiet sevi..."}
            />
          ) : (
            profile.description && <p className="mt-2">{profile.description}</p>
          )}
        </div>
      </div>

      {/* Education */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Izglītība</h3>
          {isEditing ? (
            <textarea
              className="textarea textarea-bordered"
              value={editedProfile.education}
              onChange={(e) => setEditedProfile({
                ...editedProfile,
                education: e.target.value
              })}
              placeholder="Jūsu izglītība..."
            />
          ) : (
            <p>{profile.education || "Nav norādīta"}</p>
          )}
        </div>
      </div>

      {/* Experience */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Pieredze</h3>
          {isEditing ? (
            <textarea
              className="textarea textarea-bordered"
              value={editedProfile.experience}
              onChange={(e) => setEditedProfile({
                ...editedProfile,
                experience: e.target.value
              })}
              placeholder="Jūsu pieredze..."
            />
          ) : (
            <p>{profile.experience || "Nav norādīta"}</p>
          )}
        </div>
      </div>

      {/* Subjects */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Mācību priekšmeti</h3>
          {isEditing ? (
            <input
              type="text"
              className="input input-bordered"
              value={editedProfile.subjects?.join(", ")}
              onChange={(e) => setEditedProfile({
                ...editedProfile,
                subjects: e.target.value.split(",").map(s => s.trim())
              })}
              placeholder="Priekšmeti, atdalīti ar komatu"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.subjects?.map((subject) => (
                <span key={subject} className="badge badge-secondary">{subject}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit/Save Buttons */}
      {isEditable && (
        <div className="flex gap-4">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave} 
                className="btn btn-primary flex-1"
                disabled={saving}
              >
                {saving ? "Saglabā..." : "Saglabāt"}
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditedProfile({
                    ...profile,
                    displayName: profile.displayName || '',
                    description: profile.description || '',
                    education: profile.education || '',
                    experience: profile.experience || '',
                    subjects: profile.subjects || [],
                  });
                  setError(null);
                }} 
                className="btn btn-ghost flex-1"
                disabled={saving}
              >
                Atcelt
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="btn btn-primary flex-1"
            >
              Rediģēt profilu
            </button>
          )}
        </div>
      )}

      <Dialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Kļūda"
        description={error || ""}
        actions={
          <button 
            onClick={() => setShowErrorDialog(false)}
            className="btn btn-primary"
          >
            Labi
          </button>
        }
      />
    </div>
  );
} 