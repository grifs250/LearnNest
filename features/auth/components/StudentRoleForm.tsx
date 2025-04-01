"use client";

import { useState } from "react";

interface StudentRoleFormProps {
  formData: {
    learning_goals: string[];
  };
  setFormData: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StudentRoleForm({ formData, setFormData, onBack, onNext }: StudentRoleFormProps) {
  const [goal, setGoal] = useState("");

  const handleAddGoal = () => {
    if (goal.trim() && !formData.learning_goals.includes(goal.trim())) {
      setFormData({
        ...formData,
        learning_goals: [...formData.learning_goals, goal.trim()]
      });
      setGoal("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">
          <span className="label-text">Mācīšanās mērķi</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Piem., Uzlabot angļu valodu"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddGoal();
              }
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddGoal}
          >
            Pievienot
          </button>
        </div>
        {formData.learning_goals.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.learning_goals.map((g, i) => (
              <div key={i} className="badge badge-accent badge-lg gap-1 p-3">
                <span>{g}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      learning_goals: formData.learning_goals.filter((_, idx) => idx !== i)
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