export interface DashboardUser {
  id: string;
  isTeacher: boolean;
  displayName: string;
  email: string;
  status: 'active' | 'pending' | 'blocked';
  emailVerified: boolean;
}

export interface DashboardState {
  loading: boolean;
  isTeacher: boolean;
  user: DashboardUser | null;
} 