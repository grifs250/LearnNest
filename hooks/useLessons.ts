import { useState, useEffect } from 'react';
import { db } from '@/lib/firebaseClient';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { TeacherLesson } from '@/types/lesson';

export function useLessons(teacherId: string) {
  const [lessons, setLessons] = useState<TeacherLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLessons = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'lessons'),
        where('teacherId', '==', teacherId)
      );
      const querySnapshot = await getDocs(q);
      const lessonData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeacherLesson[];
      
      setLessons(lessonData);
      setError(null);
    } catch (err) {
      console.error('Error loading lessons:', err);
      setError('Neizdevās ielādēt stundas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, [teacherId]);

  return { lessons, loading, error, reloadLessons: loadLessons };
}
export function getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'accepted':
        return 'badge-success';
      case 'rejected':
        return 'badge-error';
      case 'completed':
        return 'badge-info';
      default:
        return 'badge-warning';
    }
  }
  
  export function getStatusText(status: string): string {
    switch (status) {
      case 'accepted':
        return 'Apstiprināts';
      case 'rejected':
        return 'Noraidīts';
      case 'completed':
        return 'Pabeigts';
      default:
        return 'Gaida apstiprinājumu';
    }
  }
  
  export function formatDate(date: Date): string {
    return date.toLocaleDateString('lv-LV', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  export function formatTime(date: Date): string {
    return date.toLocaleTimeString('lv-LV', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }