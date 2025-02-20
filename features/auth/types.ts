export type AuthMode = 'login' | 'signup' | 'verify';
export type UserRole = 'skolēns' | 'pasniedzējs';

export interface AuthFormProps {
  mode: AuthMode;
  initialRole: UserRole;
  updateRole: (role: UserRole) => void;
  updateMode: (mode: AuthMode) => void;
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
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
} 