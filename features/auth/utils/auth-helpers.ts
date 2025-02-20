import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { AuthUser } from '../types';

export async function getCurrentUser(): Promise<AuthUser | null> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
  if (!userDoc.exists()) return null;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    emailVerified: firebaseUser.emailVerified,
    ...userDoc.data(),
  } as AuthUser;
}

export function getAuthErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Šis e-pasts jau ir reģistrēts',
    'auth/invalid-email': 'Nederīga e-pasta adrese',
    'auth/weak-password': 'Parole ir pārāk vāja (vismaz 6 simboli)',
    'auth/user-not-found': 'Nepareizs e-pasts vai parole',
    'auth/wrong-password': 'Nepareizs e-pasts vai parole',
    'auth/invalid-credential': 'Nepareizs e-pasts vai parole',
    'auth/user-disabled': 'Šis konts ir bloķēts',
    'auth/too-many-requests': 'Pārāk daudz mēģinājumu. Lūdzu, uzgaidiet brīdi',
    'auth/network-request-failed': 'Savienojuma kļūda. Pārbaudiet interneta pieslēgumu',
    'auth/operation-not-allowed': 'Reģistrācija šobrīd nav pieejama',
    'auth/internal-error': 'Iekšēja sistēmas kļūda. Lūdzu mēģiniet vēlreiz',
  };

  return errorMessages[code] || 'Kļūda. Lūdzu, mēģiniet vēlreiz';
} 