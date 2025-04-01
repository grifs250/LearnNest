import { User as ClerkUser } from '@clerk/nextjs/server';
import { Profile, TeacherWithSubjects, Subject, TeacherSubject, Category, Lesson } from './database.types';
import { BaseEntity, BaseFormData, UserRole, BookingStatus, PaymentStatus } from './common.types';

// Auth Feature Types
export interface User extends ClerkUser {
  profile?: Profile;
  teacherProfile?: TeacherWithSubjects;
  studentProfile?: Profile;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: Partial<Profile>) => Promise<void>;
  signout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export type SignInFormData = {
  email: string;
  password: string;
};

export type SignUpFormData = {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
};

export type UIRole = 'skolēns' | 'pasniedzējs'; // For UI display

export interface AuthUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
}

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

// Profile Feature Types
export interface ProfileFormData extends BaseFormData {
  full_name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  languages?: string[];
  learning_goals?: string[];
  hourly_rate?: number;
  education?: string[];
  experience?: string;
  verification_docs?: File[];
}

export interface TeacherProfileFormData extends ProfileFormData {
  hourly_rate: number;
  education: string[];
  experience: string;
  expertise_areas?: string[];
  available_hours?: AvailableHours;
  tax_id?: string;
  bank_account?: BankAccount;
}

export interface StudentProfileFormData extends ProfileFormData {
  learning_goals: string[];
  interests?: string[];
  age?: number;
}

export interface AvailableHours {
  [day: string]: {
    enabled: boolean;
    slots: Array<{
      start: string;
      end: string;
    }>;
  };
}

export interface BankAccount {
  account_number: string;
  bank_code: string;
  account_holder: string;
}

export interface FilterOptions {
  subjects?: string[];
  priceRange?: [number, number];
  availability?: string[];
  rating?: number;
  languages?: string[];
}

export interface ProfileStats {
  totalLessons: number;
  totalHours: number;
  averageRating: number;
  totalStudents: number;
  totalEarnings?: number;
  lessonsCompleted?: number;
  lessonsAttended?: number;
  favoriteSubjects?: string[];
}

export interface VerificationStatus {
  identity: 'pending' | 'verified' | 'rejected';
  education: 'pending' | 'verified' | 'rejected';
  payment: 'pending' | 'verified' | 'rejected';
  overall: 'pending' | 'verified' | 'rejected';
}

// Chat Feature Types
export interface ChatMessage {
  id: string;
  lesson_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

// Message Feature Types
export interface ChatMessage extends BaseEntity {
  bookingId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  sender?: User;
  booking?: BookingData;
  metadata?: Record<string, any>;
}

export interface MessageThreadProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface MessageThread {
  bookingId: string;
  student: MessageThreadProfile;
  teacher: MessageThreadProfile;
  latestMessage: ChatMessage;
}

export interface BookingWithMessages {
  id: string;
  student: {
    profile: MessageThreadProfile;
  };
  schedule: {
    lesson: {
      teacher: {
        profile: MessageThreadProfile;
      };
    };
  };
  messages: ChatMessage[];
}

export interface MessageInput {
  bookingId: string;
  senderId: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface MessageFilter {
  bookingId?: string;
  senderId?: string;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
}

// Booking Feature Types
export interface BookingInput {
  scheduleId: string;
  studentId: string;
  amount: number;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface BookingFilter {
  scheduleId?: string;
  studentId?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  studentId?: string;
  teacherId?: string;
}

export interface BookingSummary {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  averageRating: number;
}

export interface TimeRange {
  start: string; // ISO string
  end: string;   // ISO string
}

export interface WorkHours {
  monday: TimeRange | null;
  tuesday: TimeRange | null;
  wednesday: TimeRange | null;
  thursday: TimeRange | null;
  friday: TimeRange | null;
  saturday: TimeRange | null;
  sunday: TimeRange | null;
}

export interface Vacancy {
  id: string;
  lesson_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  lesson: {
    id: string;
    title: string;
    description: string | null | undefined;
    price: number;
    duration: number;
  };
  created_at: string | null;
  updated_at: string | null;
}

export interface BookingData extends BaseEntity {
  studentId: string;
  scheduleId: string;
  status: BookingStatus;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface BookedLesson {
  id: string;
  title: string;
  description: string | null;
  teacher_id: string;
  schedule: {
    id: string;
    start_time: string;
    end_time: string;
  };
  teacher: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface BookingRequest {
  id: string;
  student_id: string;
  lesson_schedule_id: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: string;
  student: {
    id: string;
    full_name: string;
    email: string;
  };
  lesson_schedule: {
    id: string;
    start_time: string;
    end_time: string;
    lesson: {
      id: string;
      title: string;
      description: string | null;
    };
  };
}

export interface BookingWithScheduleData {
  id: string;
  student_id: string;
  schedule_id: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  lesson_schedules?: {
    id: string;
    lesson_id: string;
    start_time: string;
    end_time: string;
    is_available: boolean;
    lessons?: {
      id: string;
      title: string;
      description: string | null;
      price: number;
      teacher_id: string;
    };
  } | null;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

// Helper functions
export const mapUIRoleToStorageRole = (uiRole: UIRole): UserRole => {
  return uiRole === 'pasniedzējs' ? UserRole.TEACHER : UserRole.STUDENT;
};

export const mapStorageRoleToUIRole = (storageRole: UserRole): UIRole => {
  return storageRole === UserRole.TEACHER ? 'pasniedzējs' : 'skolēns';
};

// Subject Feature Types
export interface SubjectFilters {
  parentId?: string;
  isActive?: boolean;
  search?: string;
}

export interface SubjectSummary {
  totalSubjects: number;
  activeSubjects: number;
  totalTeachers: number;
  popularSubjects: Array<{
    id: string;
    name: string;
    teacherCount: number;
  }>;
}

export interface SubjectWithCategory extends Subject {
  category?: Category;
  teacherCount?: number;
  averageRating?: number;
  metadata?: Record<string, any>;
}

export interface CategoryWithSubjects extends Category {
  subjects: Subject[];
}

export interface SubjectDetailProps {
  subject: SubjectWithCategory;
  relatedSubjects?: Subject[];
  teacherSubjects?: TeacherSubject[];
}

// Dashboard Feature Types
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

// Payment Feature Types
export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  timeSlot: string;
  price: number;
  onPaymentComplete: () => void;
}

export interface Payment {
  id: string;
  lessonId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface PaymentError {
  code: string;
  message: string;
}

// Schedule Feature Types
export interface TimeSlot {
  start: string; // Format: "HH:mm"
  end: string;   // Format: "HH:mm"
}

export interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeSlot[];
}

export interface TeacherWorkHoursProps {
  readonly teacherId: string;
}

export const DAYS = [
  { id: 0, name: 'Svētdiena' },
  { id: 1, name: 'Pirmdiena' },
  { id: 2, name: 'Otrdiena' },
  { id: 3, name: 'Trešdiena' },
  { id: 4, name: 'Ceturtdiena' },
  { id: 5, name: 'Piektdiena' },
  { id: 6, name: 'Sestdiena' }
] as const;

export interface WorkScheduleProps {
  readonly initialWorkHours?: WorkHours;
}

export interface TimeSlotRowProps {
  readonly slot: TimeSlot;
  readonly dayId: number;
  readonly index: number;
  readonly canDelete: boolean;
  readonly onTimeChange: (dayId: number, index: number, field: keyof TimeSlot, value: string) => void;
  readonly onRemove: (dayId: number, index: number) => void;
}

export interface ScheduleHelpers {
  getNextFourWeeksDates: (dayId: string) => string[];
  saveSchedule: (schedule: WorkHours, userId: string) => Promise<void>;
}

// Feature-specific types imported from lessons/hooks/useStudentLessons.ts
export interface StudentLesson {
  id: string;
  bookingId: string;
  subject: string;
  teacherName: string;
  teacherId: string;
  date: string;
  time: string;
  status: BookingStatus;
  category: string;
  subjectId: string;
}

// Feature-specific types imported from bookings/services/bookingService.ts
export interface Vacancy {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  lesson_id: string;
  lesson: {
    id: string;
    title: string;
    description: string | null | undefined;
    price: number;
    duration: number;
  };
  created_at: string | null;
  updated_at: string | null;
}

// Feature-specific lesson types
export interface LessonWithProfile extends Lesson {
  teacher: Profile;
}

// Booking with additional details for UI display
export interface BookingWithDetails extends BaseEntity {
  student_id: string;
  schedule_id: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  amount: number;
  schedule: {
    id: string;
    lesson_id: string;
    start_time: string;
    end_time: string;
    is_available: boolean;
  };
  lesson: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    duration?: number;
    teacher: {
      id: string;
      full_name: string;
      email: string;
      avatar_url?: string | null;
    };
  };
} 