import type { Profile } from './profile';

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  profile?: Profile;
} 