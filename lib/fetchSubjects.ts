import { Subject } from '@/features/lessons/types';

export async function fetchSubjects(): Promise<Subject[]> {
  try {
    const response = await fetch('/api/subjects');
    if (!response.ok) {
      throw new Error('Failed to fetch subjects');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
} 