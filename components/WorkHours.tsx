import { useState, useEffect } from 'react';
import { db } from "../lib/firebaseClient";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface WorkHoursProps {
  readonly teacherId: string;
}

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}

interface WorkSchedule {
  [key: string]: DaySchedule;
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export function WorkHours({ teacherId }: WorkHoursProps) {
  const [workHours, setWorkHours] = useState<WorkSchedule>({
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkHours = async () => {
      try {
        const docRef = doc(db, "teacherWorkHours", teacherId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && 'monday' in data) {
            setWorkHours(data as WorkSchedule);
          }
        }
      } catch (err) {
        console.error("Error loading work hours:", err);
        setError("Neizdevās ielādēt darba laikus");
      } finally {
        setLoading(false);
      }
    };

    loadWorkHours();
  }, [teacherId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      await setDoc(doc(db, "teacherWorkHours", teacherId), workHours);
    } catch (err) {
      console.error("Error saving work hours:", err);
      setError("Neizdevās saglabāt darba laikus");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading loading-spinner loading-lg"></div>;

  return (
    <div className="space-y-4">
      {error && <div className="alert alert-error">{error}</div>}

      {Object.entries(workHours).map(([day, hours]) => (
        <div key={day} className="flex items-center gap-4">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={hours.enabled}
            onChange={(e) => setWorkHours(prev => ({
              ...prev,
              [day as keyof WorkSchedule]: { ...prev[day as keyof WorkSchedule], enabled: e.target.checked }
            }))}
          />
          <span className="w-32 capitalize">{day}</span>
          <input
            type="time"
            className="input input-bordered"
            value={hours.start}
            onChange={(e) => setWorkHours(prev => ({
              ...prev,
              [day as keyof WorkSchedule]: { ...prev[day as keyof WorkSchedule], start: e.target.value }
            }))}
            disabled={!hours.enabled}
          />
          <span>-</span>
          <input
            type="time"
            className="input input-bordered"
            value={hours.end}
            onChange={(e) => setWorkHours(prev => ({
              ...prev,
              [day as keyof WorkSchedule]: { ...prev[day as keyof WorkSchedule], end: e.target.value }
            }))}
            disabled={!hours.enabled}
          />
        </div>
      ))}

      <button 
        onClick={handleSave} 
        className="btn btn-primary w-full"
        disabled={saving}
      >
        {saving ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          'Saglabāt'
        )}
      </button>
    </div>
  );
} 