export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'student' | 'teacher';
  bio?: string;
  // Teacher specific fields
  education?: string;
  experience?: string;
  subjects?: string[];
  workHours?: {
    [key: string]: { // date in ISO format
      start: string; // HH:mm format
      end: string;   // HH:mm format
    }[];
  };
  // Student specific fields
  grade?: string;
  interests?: string[];
  preferredSubjects?: string[];
} 