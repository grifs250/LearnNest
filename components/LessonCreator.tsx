import { useState } from 'react';
import { db } from "../lib/firebaseClient";
import { collection, addDoc } from "firebase/firestore";

interface LessonCreatorProps {
  readonly teacherId: string;
  readonly onLessonCreated?: () => void;
}

export function LessonCreator({ teacherId, onLessonCreated }: LessonCreatorProps) {
  const [subject, setSubject] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, "lessons"), {
        teacherId,
        subject,
        price: Number(price),
        description,
        bookedTimes: {},
        createdAt: new Date()
      });
      
      setSubject('');
      setPrice('');
      setDescription('');
      onLessonCreated?.();
    } catch (error) {
      console.error("Error creating lesson:", error);
      setError("Neizdevās izveidot stundu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="subject" className="label">Priekšmets</label>
        <input
          id="subject"
          type="text"
          className="input input-bordered w-full"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="label">Apraksts</label>
        <textarea
          id="description"
          className="textarea textarea-bordered w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="price" className="label">Cena (€/h)</label>
        <input
          id="price"
          type="number"
          className="input input-bordered w-full"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="0"
          step="0.01"
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary w-full"
        disabled={loading}
      >
        {loading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          'Izveidot Stundu'
        )}
      </button>
    </form>
  );
}