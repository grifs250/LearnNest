"use client";
import { useState } from "react";
import { ProfileData } from "@/types/profile";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { Dialog } from "./Dialog";

interface StudentInfoCardProps {
  profile: ProfileData;
  isEditable?: boolean;
}

export default function StudentInfoCard({ profile, isEditable = false }: StudentInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const handleSave = async () => {
    if (!isEditable || !profile.uid) return;
    setSaving(true);
    setError(null);

    try {
      await updateDoc(doc(db, "users", profile.uid), {
        displayName: editedProfile.displayName,
        description: editedProfile.description || null,
        grade: editedProfile.grade || null,
        interests: editedProfile.interests || [],
      });
      setIsEditing(false);
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
            />
          ) : (
            <h2 className="card-title text-2xl">
              {profile.displayName}
              <span className="badge badge-primary">Skolēns</span>
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
              placeholder="Pastāsti par sevi..."
            />
          ) : (
            profile.description && <p className="mt-2">{profile.description}</p>
          )}
        </div>
      </div>

      {/* Grade */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Klase</h3>
          {isEditing ? (
            <input
              type="text"
              className="input input-bordered"
              value={editedProfile.grade || ''}
              onChange={(e) => setEditedProfile({
                ...editedProfile,
                grade: e.target.value
              })}
              placeholder="Piemēram: 9. klase"
            />
          ) : (
            <p>{profile.grade}</p>
          )}
        </div>
      </div>

      {/* Interests */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Intereses</h3>
          {isEditing ? (
            <input
              type="text"
              className="input input-bordered"
              value={editedProfile.interests?.join(", ")}
              onChange={(e) => setEditedProfile({
                ...editedProfile,
                interests: e.target.value.split(",").map(s => s.trim())
              })}
              placeholder="Intereses, atdalītas ar komatu"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.interests?.map((interest) => (
                <span key={interest} className="badge badge-primary">{interest}</span>
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
                  setEditedProfile(profile);
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