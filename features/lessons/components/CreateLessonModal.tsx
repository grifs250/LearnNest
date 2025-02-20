"use client";

import { LessonForm } from "./LessonForm";
import { toast } from "react-hot-toast";

interface CreateLessonModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onLessonCreated: () => void;
}

export function CreateLessonModal({ 
  isOpen, 
  onClose, 
  onLessonCreated 
}: CreateLessonModalProps) {
  if (!isOpen) return null;

  const handleSuccess = () => {
    onLessonCreated();
    onClose();
    toast.success("Nodarbība izveidota veiksmīgi!");
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Izveidot jaunu nodarbību</h3>
        <LessonForm onLessonCreated={handleSuccess} />
        <div className="modal-action">
          <button className="btn" onClick={onClose}>Aizvērt</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}>
        <button className="cursor-default w-full h-full"></button>
      </div>
    </div>
  );
} 