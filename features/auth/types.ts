export type AuthMode = 'login' | 'signup';
export type UserRole = 'skolēns' | 'pasniedzējs';

export interface AuthFormProps {
  initialMode: AuthMode;
  initialRole: UserRole;
  updateRole: (role: 'skolēns' | 'pasniedzējs') => void;
  updateMode: (mode: AuthMode) => void;
  mode: AuthMode;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  isTeacher: boolean;
  status: 'pending' | 'active' | 'blocked';
  createdAt: Date;
}

export interface AuthState {
  mode: AuthMode;
  role: UserRole;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
} 