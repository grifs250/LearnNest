"use client";

import { useState } from "react";

interface TeacherRoleFormProps {
  formData: {
    hourly_rate: number | null;
    education: string[];
    experience: string[];
    specializations: string[];
  };
  setFormData: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export function TeacherRoleForm({ formData, setFormData, onBack, onNext }: TeacherRoleFormProps) {
  const [educationItem, setEducationItem] = useState("");
  const [experienceItem, setExperienceItem] = useState("");
  const [specializationItem, setSpecializationItem] = useState("");

  const handleAddEducation = () => {
    if (educationItem.trim() && !formData.education.includes(educationItem.trim())) {
      setFormData({
        ...formData,
        education: [...formData.education, educationItem.trim()]
      });
      setEducationItem("");
    }
  };

  const handleAddExperience = () => {
    if (experienceItem.trim() && !formData.experience.includes(experienceItem.trim())) {
      setFormData({
        ...formData,
        experience: [...formData.experience, experienceItem.trim()]
      });
      setExperienceItem("");
    }
  };

  const handleAddSpecialization = () => {
    if (specializationItem.trim() && !formData.specializations.includes(specializationItem.trim())) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, specializationItem.trim()]
      });
      setSpecializationItem("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">
          <span className="label-text">Stundas maksa (€)</span>
        </label>
        <input
          type="number"
          step="0.01"
          className="input input-bordered w-full"
          value={formData.hourly_rate || ""}
          onChange={(e) => setFormData({
            ...formData,
            hourly_rate: e.target.value ? Number(e.target.value) : null
          })}
          placeholder="15.00"
          required
        />
      </div>

      <div>
        <label className="label">
          <span className="label-text">Izglītība</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={educationItem}
            onChange={(e) => setEducationItem(e.target.value)}
            placeholder="Piem., Bakalaura grāds matemātikā"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddEducation();
              }
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddEducation}
          >
            Pievienot
          </button>
        </div>
        {formData.education.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.education.map((edu, i) => (
              <div key={i} className="badge badge-secondary badge-lg gap-1 p-3">
                <span>{edu}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      education: formData.education.filter((_, idx) => idx !== i)
                    });
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="label">
          <span className="label-text">Pieredze</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={experienceItem}
            onChange={(e) => setExperienceItem(e.target.value)}
            placeholder="Piem., 5 gadi skolā kā matemātikas skolotājs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddExperience();
              }
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddExperience}
          >
            Pievienot
          </button>
        </div>
        {formData.experience.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.experience.map((exp, i) => (
              <div key={i} className="badge badge-secondary badge-lg gap-1 p-3">
                <span>{exp}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      experience: formData.experience.filter((_, idx) => idx !== i)
                    });
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="label">
          <span className="label-text">Specializācijas</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={specializationItem}
            onChange={(e) => setSpecializationItem(e.target.value)}
            placeholder="Piem., Algebriskās vienādojumu sistēmas"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSpecialization();
              }
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddSpecialization}
          >
            Pievienot
          </button>
        </div>
        {formData.specializations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.specializations.map((spec, i) => (
              <div key={i} className="badge badge-secondary badge-lg gap-1 p-3">
                <span>{spec}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      specializations: formData.specializations.filter((_, idx) => idx !== i)
                    });
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onBack}
        >
          Atpakaļ
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNext}
        >
          Tālāk
        </button>
      </div>
    </div>
  );
} 