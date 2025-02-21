"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Lesson } from '@/features/lessons/types';
import { supabase } from '@/lib/supabase/db';

interface EditLessonModalProps {
  lesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EditLessonModal({ lesson, isOpen, onClose, onSave }: EditLessonModalProps) {
  const [title, setTitle] = useState(lesson.subject);
  const [description, setDescription] = useState(lesson.description || '');
  const [price, setPrice] = useState(lesson.price || 0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          subject: title,
          description,
          price
        })
        .eq('id', lesson.id);

      if (error) throw error;

      toast.success('Lesson updated successfully');
      onSave();
      onClose();
    } catch (err) {
      console.error('Error updating lesson:', err);
      toast.error('Failed to update lesson');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Edit Lesson</h3>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered"
          />
        </div>

        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered"
          />
        </div>

        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Price</span>
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="input input-bordered"
          />
        </div>

        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 