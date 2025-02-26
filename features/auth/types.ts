export type AuthMode = 'login' | 'register';
export type UserRole = 'student' | 'teacher' | 'admin';
export type UIRole = 'skolēns' | 'pasniedzējs'; // For UI display

export interface AuthFormProps {
  initialMode: AuthMode;
  initialRole: UIRole;
  updateRole: (role: UIRole) => void;
  updateMode: (mode: AuthMode) => void;
  mode: AuthMode;
}

// Helper function to convert UI role to storage role
export const mapUIRoleToStorageRole = (uiRole: UIRole): UserRole => {
  return uiRole === 'pasniedzējs' ? 'teacher' : 'student';
};

// Helper function to convert storage role to UI role
export const mapStorageRoleToUIRole = (storageRole: UserRole): UIRole => {
  return storageRole === 'teacher' ? 'pasniedzējs' : 'skolēns';
};

export interface AuthUser {
  id: string;
  email: string | null;
  user_metadata: {
    role: UserRole;
    full_name: string;
  };
  email_confirmed_at?: string;
}

export interface AuthState {
  mode: AuthMode;
  role: UserRole;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
} 