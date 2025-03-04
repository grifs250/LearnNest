"use client";

import { useState, useEffect } from "react";
import { useClerkSupabase } from "@/lib/hooks/useClerkSupabase";
import { fetchSubjects } from "@/lib/fetchSubjects";
import { Subject } from "@/features/lessons/types";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";

interface LessonFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
}

export function LessonForm({ onSubmit, onCancel }: LessonFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const { supabase, isLoading: isClientLoading } = useClerkSupabase();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    price: 0,
    duration: 60,
    max_students: 1,
    is_active: true
  });

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await fetchSubjects();
        setSubjects(data);
      } catch (error) {
        console.error('Error loading subjects:', error);
        toast.error('Failed to load subjects');
      }
    };

    loadSubjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) {
      toast.error('You must be logged in to create a lesson');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .insert({
          ...formData,
          teacher_id: user.id,
        });

      if (error) throw error;

      toast.success('Lesson created successfully');
      onSubmit?.();
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error('Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  if (isClientLoading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">
          <span className="label-text">Title</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
      </div>

      <div>
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="textarea textarea-bordered w-full"
          required
        />
      </div>

      <div>
        <label className="label">
          <span className="label-text">Subject</span>
        </label>
        <select
          name="subject_id"
          value={formData.subject_id}
          onChange={handleChange}
          className="select select-bordered w-full"
          required
        >
          <option value="">Select a subject</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">
          <span className="label-text">Price (€)</span>
        </label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="input input-bordered w-full"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div>
        <label className="label">
          <span className="label-text">Duration (minutes)</span>
        </label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          className="input input-bordered w-full"
          min="30"
          step="15"
          required
        />
      </div>

      <div>
        <label className="label">
          <span className="label-text">Maximum Students</span>
        </label>
        <input
          type="number"
          name="max_students"
          value={formData.max_students}
          onChange={handleChange}
          className="input input-bordered w-full"
          min="1"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Lesson'}
        </button>
      </div>
    </form>
  );
}
