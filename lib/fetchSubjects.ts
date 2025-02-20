import { adminDb } from './firebase/admin';
import { Subject } from '@/features/lessons/types';

export async function fetchSubjects(): Promise<Subject[]> {
  const snapshot = await adminDb.collection('subjects').get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as Subject[];
} 