import { User } from '@clerk/nextjs/server';

export type AuthUser = User;

export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export type UIRole = 'skolēns' | 'pasniedzējs'; // For UI display

// Helper function to convert UI role to storage role
export const mapUIRoleToStorageRole = (uiRole: UIRole): UserRole => {
  return uiRole === 'pasniedzējs' ? 'teacher' : 'student';
};

// Helper function to convert storage role to UI role
export const mapStorageRoleToUIRole = (storageRole: UserRole): UIRole => {
  return storageRole === 'teacher' ? 'pasniedzējs' : 'skolēns';
};