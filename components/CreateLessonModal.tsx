"use client";
import LessonForm from "@/components/LessonForm";

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLessonCreated: () => void;
}

export default function CreateLessonModal({ isOpen, onClose, onLessonCreated }: CreateLessonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Izveidot jaunu nodarbību</h3>
        <LessonForm onLessonCreated={() => {
          onLessonCreated();
          onClose();
        }} />
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