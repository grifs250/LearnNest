"use client";
import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { Lesson } from '@/types/lesson';

interface EditLessonModalProps {
  readonly lesson: Lesson | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onLessonUpdated: () => void;
}

export default function EditLessonModal({ lesson, isOpen, onClose, onLessonUpdated }: EditLessonModalProps) {
  const [description, setDescription] = useState(lesson?.description ?? '');
  const [saving, setSaving] = useState(false);

  // Update description when lesson changes
  useEffect(() => {
    if (lesson) {
      setDescription(lesson.description || '');
    }
  }, [lesson]);

  if (!isOpen || !lesson) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lesson) {
      console.error("No lesson to update");
      return;
    }

    setSaving(true);
    
    try {
      await updateDoc(doc(db, "lessons", lesson.id), {
        description
      });
      
      onLessonUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating lesson:", error);
      alert("Failed to update lesson");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Rediģēt nodarbību</h3>
        <p className="text-gray-600 mb-4">{lesson.subject}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label className="label" htmlFor="edit-description">
              <span className="label-text">Apraksts</span>
            </label>
            <textarea
              id="edit-description"
              className="textarea textarea-bordered h-32"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Atcelt
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saglabā..." : "Saglabāt"}
            </button>
          </div>
        </form>
      </div>
      <button 
        className="modal-backdrop" 
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label="Close modal"
      >
        <span className="cursor-default w-full h-full" />
      </button>
    </div>
  );
} 