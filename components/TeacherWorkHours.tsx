"use client";
import { useState, useEffect } from 'react';
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { WorkHours, TimeRange } from '@/types/lesson';

const DAYS = [
  { id: 0, name: 'Svētdiena' },
  { id: 1, name: 'Pirmdiena' },
  { id: 2, name: 'Otrdiena' },
  { id: 3, name: 'Trešdiena' },
  { id: 4, name: 'Ceturtdiena' },
  { id: 5, name: 'Piektdiena' },
  { id: 6, name: 'Sestdiena' }
];

interface TeacherWorkHoursProps {
  readonly teacherId: string;
}

async function fetchWorkHours(teacherId: string, setWorkHours: (hours: WorkHours) => void, setLoading: (loading: boolean) => void) {
  try {
    const teacherDoc = await getDoc(doc(db, "users", teacherId));
    console.log('Teacher doc data:', teacherDoc.data());
    
    const rawWorkHours = teacherDoc.data()?.workHours as { [key: string]: { timeSlots: TimeRange | TimeRange[] } } | undefined;
    if (teacherDoc.exists() && rawWorkHours) {
      // Convert to numeric format if needed
      const formattedWorkHours: WorkHours = {};
      Object.entries(rawWorkHours).forEach(([day, dayData]) => {
        const numericDay = parseInt(day, 10);
        if (!isNaN(numericDay) && numericDay >= 0 && numericDay <= 6) {
          formattedWorkHours[numericDay] = {
            enabled: true,
            timeSlots: Array.isArray(dayData.timeSlots) ? dayData.timeSlots : [dayData.timeSlots]
          };
        }
      });
      
      console.log('Setting formatted work hours:', formattedWorkHours);
      setWorkHours(formattedWorkHours);
    } else {
      console.log('No work hours found in teacher doc');
      // Initialize with default empty schedule
      const defaultWorkHours: WorkHours = {};
      DAYS.forEach(day => {
        defaultWorkHours[day.id] = {
          enabled: false,
          timeSlots: [{ start: '09:00', end: '17:00' }]
        };
      });
      setWorkHours(defaultWorkHours);
    }
    setLoading(false);
  } catch (error) {
    console.error("Error fetching work hours:", error);
    setLoading(false);
  }
}

export default function TeacherWorkHours({ teacherId }: TeacherWorkHoursProps) {
  const [workHours, setWorkHours] = useState<WorkHours>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('TeacherWorkHours mounted with teacherId:', teacherId);
    fetchWorkHours(teacherId, setWorkHours, setLoading);
  }, [teacherId]);

  useEffect(() => {
    console.log('WorkHours state updated:', workHours);
  }, [workHours]);

  const handleWorkHoursUpdate = async (dayId: number, range: TimeRange) => {
    try {
      const updatedWorkHours = {
        ...workHours,
        [dayId]: {
          enabled: true,
          timeSlots: [range]
        }
      };

      console.log('Updating work hours:', updatedWorkHours);

      await updateDoc(doc(db, "users", teacherId), {
        workHours: updatedWorkHours
      });
      setWorkHours(updatedWorkHours);
      alert('Darba laiks atjaunināts!');
    } catch (error) {
      console.error("Error updating work hours:", error);
      alert('Kļūda atjauninot darba laiku');
    }
  };

  if (loading) return <div>Ielādē...</div>;

  return (
    <div className="space-y-4">
      {DAYS.map(day => (
        <div key={day.id} className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold">{day.name}</h3>
            <div className="flex gap-4">
              <input
                type="time"
                className="input input-bordered"
                value={workHours[day.id]?.timeSlots[0]?.start || '09:00'}
                onChange={(e) => {
                  const currentRange = workHours[day.id]?.timeSlots[0] || { start: '09:00', end: '17:00' };
                  handleWorkHoursUpdate(day.id, { ...currentRange, start: e.target.value });
                }}
              />
              <span>-</span>
              <input
                type="time"
                className="input input-bordered"
                value={workHours[day.id]?.timeSlots[0]?.end || '17:00'}
                onChange={(e) => {
                  const currentRange = workHours[day.id]?.timeSlots[0] || { start: '09:00', end: '17:00' };
                  handleWorkHoursUpdate(day.id, { ...currentRange, end: e.target.value });
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 