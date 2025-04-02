"use client";

import { useState } from "react";
import { PlusCircle, X } from "lucide-react";

interface StudentRoleFormProps {
  formData: {
    learning_goals: string[];
  };
  setFormData: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
  errors?: Record<string, string>;
}

export function StudentRoleForm({ formData, setFormData, onBack, onNext, errors = {} }: StudentRoleFormProps) {
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
    <div className="space-y-6">
      <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
        <h3 className="font-medium mb-1 flex items-center gap-2">
          <span className="text-xl">📚</span>
          <span>Mācīšanās mērķi</span>
        </h3>
        <p className="text-sm text-base-content/70 mb-4">Norādiet savus galvenos mācīšanās mērķus, lai pasniedzēji labāk saprastu jūsu vajadzības.</p>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              className={`input input-bordered flex-1 ${errors.learning_goals ? 'input-error' : ''}`}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Piem., Uzlabot angļu valodu, Sagatavoties eksāmenam"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddGoal();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-accent"
              onClick={handleAddGoal}
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">Pievienot</span>
            </button>
          </div>
          
          {errors.learning_goals && (
            <p className="text-error text-sm">{errors.learning_goals}</p>
          )}
          
          {formData.learning_goals.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.learning_goals.map((g, i) => (
                <div key={i} className="badge badge-accent gap-1 p-3">
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
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-base-content/50 text-sm border border-dashed border-base-content/20 rounded-lg">
              Pievienojiet vismaz vienu mācīšanās mērķi
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          className="btn btn-outline btn-sm sm:btn-md"
          onClick={onBack}
        >
          Atpakaļ
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm sm:btn-md"
          onClick={onNext}
        >
          Tālāk
        </button>
      </div>
    </div>
  );
} 