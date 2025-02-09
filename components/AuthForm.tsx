import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

// After successful sign in/up
const checkProfile = async (user: User) => {
  const router = useRouter();
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || !userDoc.data().displayName) {
    router.push('/profile/setup');
    return;
  }
  router.push('/profile');
}; 