// UI Components
export * from './ui';

// Dialog and Toast Components
export * from './ui/Toast';
export * from './ui/ToastContainer';
export * from './ui/ConfirmDialog';

// Re-export types
export type { ToastType } from './ui/Toast';

// Import components with their proper exports
import { Footer } from './Footer';
import { ErrorBoundary } from './ErrorBoundary';
import Navbar from './Navbar';
import ClientInitializer from './ClientInitializer';
import ProfileRedirectCheck from './ProfileRedirectCheck';
import UserMenu from './UserMenu';
import { LoadingSpinner } from './LoadingSpinner';
import { UserInfoModal } from './UserInfoModal';
import { ConfirmDialog } from './ConfirmDialog';
import { Toast } from './Toast';
import BujSection from './BujSection';
import SubjectCategory from './SubjectCategory';
import TeacherProfile from './TeacherProfile';

// UI component imports
import * as UI from './ui';

// Export all components
export {
  Footer,
  ErrorBoundary,
  Navbar,
  ClientInitializer,
  ProfileRedirectCheck,
  UserMenu,
  LoadingSpinner,
  UserInfoModal,
  ConfirmDialog,
  Toast,
  BujSection,
  SubjectCategory,
  TeacherProfile,
  UI,
};

// Export default
export default {
  Footer,
  ErrorBoundary,
  Navbar,
  ClientInitializer,
  ProfileRedirectCheck,
  UserMenu,
  LoadingSpinner,
  UserInfoModal,
  ConfirmDialog,
  Toast,
  BujSection,
  SubjectCategory,
  TeacherProfile,
  UI,
}; 