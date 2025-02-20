export interface AuthFormProps {
  initialMode: string;
  initialRole: string;
  updateRole: (role: string) => void;
  updateMode: (mode: string) => void;
}

export type AuthMode = 'login' | 'register' | 'verify';
export type UserRole = 'student' | 'teacher'; 