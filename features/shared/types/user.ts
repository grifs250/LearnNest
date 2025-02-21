export interface UserInfo {
  displayName: string;
  email: string;
  description: string;
  isTeacher: boolean;
  status: 'active' | 'pending' | 'blocked';
  createdAt: string;
}

export interface UserInfoModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
} 