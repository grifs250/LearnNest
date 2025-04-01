import type { Json, UserRole, BaseEntity, Metadata, Settings } from '@/lib/types/common.types';

// Database schema types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      student_profiles: {
        Row: StudentProfile;
        Insert: StudentProfileInsert;
        Update: StudentProfileUpdate;
      };
      teacher_profiles: {
        Row: TeacherProfile;
        Insert: TeacherProfileInsert;
        Update: TeacherProfileUpdate;
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      subjects: {
        Row: Subject;
        Insert: SubjectInsert;
        Update: SubjectUpdate;
      };
      lessons: {
        Row: Lesson;
        Insert: LessonInsert;
        Update: LessonUpdate;
      };
      lesson_schedules: {
        Row: LessonSchedule;
        Insert: LessonScheduleInsert;
        Update: LessonScheduleUpdate;
      };
      bookings: {
        Row: Booking;
        Insert: BookingInsert;
        Update: BookingUpdate;
      };
      reviews: {
        Row: Review;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
      payment_intents: {
        Row: PaymentIntent;
        Insert: PaymentIntentInsert;
        Update: PaymentIntentUpdate;
      };
      wallets: {
        Row: Wallet;
        Insert: WalletInsert;
        Update: WalletUpdate;
      };
      wallet_transactions: {
        Row: WalletTransaction;
        Insert: WalletTransactionInsert;
        Update: WalletTransactionUpdate;
      };
      teacher_subjects: {
        Row: TeacherSubject;
        Insert: TeacherSubjectInsert;
        Update: TeacherSubjectUpdate;
      };
      teacher_work_hours: {
        Row: TeacherWorkHours;
        Insert: TeacherWorkHoursInsert;
        Update: TeacherWorkHoursUpdate;
      };
      audit_log: {
        Row: AuditLog;
        Insert: AuditLogInsert;
        Update: AuditLogUpdate;
      };
    };
    Views: {
      user_profiles: {
        Row: UserProfile;
        Insert: never;
        Update: never;
      };
    };
    Functions: {
      get_current_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      has_role: {
        Args: { required_role: UserRole };
        Returns: boolean;
      };
      is_teacher: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_teacher_availability: {
        Args: {
          teacher_id: string;
          start_date: string;
          end_date: string;
        };
        Returns: {
          date: string;
          available_slots: Json;
        }[];
      };
      get_lesson_counts_by_subject: {
        Args: Record<PropertyKey, never>;
        Returns: {
          subject_id: string;
          count: number;
        }[];
      };
      get_teacher_lesson_count: {
        Args: { teacher_profile_id: string };
        Returns: number;
      };
    };
    Enums: {
      user_role: UserRole;
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
      payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
    };
  }
}

// Profile types
export interface Profile extends BaseEntity {
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  bio?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  metadata?: Metadata;
  settings?: Settings;
  hourly_rate?: number | null;
  learning_goals?: string[] | null;
  phone?: string | null;
  age?: number | null;
  languages?: string[] | null;
  education_documents?: string[] | null;
  tax_id?: string | null;
  personal_id?: string | null;
  verification_status?: string | null;
  stripe_customer_id?: string | null;
  stripe_account_id?: string | null;
}

export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<ProfileInsert>;

// Category types
export interface Category extends BaseEntity {
  name: string;
  description?: string | null;
  display_order?: number;
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
export type CategoryUpdate = Partial<CategoryInsert>;

// Subject types
export interface Subject extends BaseEntity {
  name: string;
  slug: string;
  description?: string | null;
  icon_url?: string | null;
  is_active: boolean;
  parent_id?: string | null;
  category_id?: string | null;
  metadata?: Json;
}

export type SubjectInsert = Omit<Subject, 'id' | 'created_at' | 'updated_at'>;
export type SubjectUpdate = Partial<SubjectInsert>;

// Lesson types
export interface Lesson extends BaseEntity {
  teacher_id: string;
  subject_id: string;
  title: string;
  description?: string | null;
  duration: number;
  max_students: number;
  price: number;
  is_active: boolean;
  metadata?: Json;
}

export type LessonInsert = Omit<Lesson, 'id' | 'created_at' | 'updated_at'>;
export type LessonUpdate = Partial<LessonInsert>;

// Lesson schedule types
export interface LessonSchedule extends BaseEntity {
  lesson_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export type LessonScheduleInsert = Omit<LessonSchedule, 'id' | 'created_at' | 'updated_at'>;
export type LessonScheduleUpdate = Partial<LessonScheduleInsert>;

// Booking types
export interface Booking extends BaseEntity {
  student_id: string;
  schedule_id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  amount: number;
  metadata?: Json;
}

export type BookingInsert = Omit<Booking, 'id' | 'created_at' | 'updated_at'>;
export type BookingUpdate = Partial<BookingInsert>;

// Review types
export interface Review extends BaseEntity {
  booking_id: string;
  student_id: string;
  teacher_id: string;
  rating: number;
  comment: string;
  is_public: boolean;
  booking?: Booking;
  student?: Profile;
  teacher?: Profile;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export type ReviewInsert = Omit<Review, 'id' | 'created_at' | 'updated_at'>;
export type ReviewUpdate = Partial<ReviewInsert>;

// Message types
export interface Message extends BaseEntity {
  booking_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  sender?: Profile;
  recipient?: Profile;
}

export type MessageInsert = Omit<Message, keyof BaseEntity>;
export type MessageUpdate = Partial<MessageInsert>;

// Thread types
export interface Thread extends BaseEntity {
  participants: Profile[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

export type ThreadInsert = Omit<Thread, keyof BaseEntity>;
export type ThreadUpdate = Partial<ThreadInsert>;

// Thread profile types
export interface ThreadProfile extends Pick<Profile, 'id' | 'full_name' | 'avatar_url'> {}

// Notification types
export interface Notification extends BaseEntity {
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  metadata?: Json;
}

export type NotificationInsert = Omit<Notification, 'id' | 'created_at' | 'updated_at'>;
export type NotificationUpdate = Partial<NotificationInsert>;

// Payment intent types
export interface PaymentIntent extends BaseEntity {
  stripe_payment_intent_id: string;
  booking_id?: string | null;
  amount: number;
  currency: string;
  status: string;
  metadata?: Json;
}

export type PaymentIntentInsert = Omit<PaymentIntent, 'id' | 'created_at' | 'updated_at'>;
export type PaymentIntentUpdate = Partial<PaymentIntentInsert>;

// Wallet types
export interface Wallet extends BaseEntity {
  profile_id?: string | null;
  balance: number;
  currency: string;
}

export type WalletInsert = Omit<Wallet, 'id' | 'created_at' | 'updated_at'>;
export type WalletUpdate = Partial<WalletInsert>;

// Wallet transaction types
export interface WalletTransaction extends BaseEntity {
  wallet_id?: string | null;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'payout';
  status: 'pending' | 'completed' | 'failed';
  metadata?: Json;
}

export type WalletTransactionInsert = Omit<WalletTransaction, 'id' | 'created_at' | 'updated_at'>;
export type WalletTransactionUpdate = Partial<WalletTransactionInsert>;

// Teacher subject types
export interface TeacherSubject extends BaseEntity {
  teacher_id: string;
  subject_id: string;
  experience_years?: number;
  hourly_rate?: number;
  is_verified?: boolean;
}

export type TeacherSubjectInsert = Omit<TeacherSubject, 'id' | 'created_at' | 'updated_at'>;
export type TeacherSubjectUpdate = Partial<TeacherSubjectInsert>;

// Teacher work hours types
export interface TeacherWorkHours extends BaseEntity {
  teacher_id: string;
  day_0?: string | null;
  day_1?: string | null;
  day_2?: string | null;
  day_3?: string | null;
  day_4?: string | null;
  day_5?: string | null;
  day_6?: string | null;
}

export type TeacherWorkHoursInsert = Omit<TeacherWorkHours, 'id' | 'created_at' | 'updated_at'>;
export type TeacherWorkHoursUpdate = Partial<TeacherWorkHoursInsert>;

// Audit log types
export interface AuditLog extends BaseEntity {
  table_name: string;
  record_id: string;
  action: string;
  old_data?: Json;
  new_data?: Json;
  changed_by: string;
}

export type AuditLogInsert = Omit<AuditLog, 'id' | 'created_at'>;
export type AuditLogUpdate = Partial<AuditLogInsert>;

// View types
export interface UserProfile extends Profile {
  teacher_bio?: string | null;
  teacher_rate?: number | null;
  student_goals?: string[] | null;
  profile_type: UserRole;
  url_slug: string;
  page_title: string;
}

// Composite types for API responses
export interface LessonWithSchedule extends Lesson {
  schedules?: LessonSchedule[];
  teacher?: Profile;
  subject?: Subject;
}

export interface BookingWithDetails extends Booking {
  schedule?: LessonSchedule;
  lesson?: Lesson;
  student?: Profile;
  teacher?: Profile;
  reviews?: Review[];
}

export interface TeacherWithSubjects extends Profile {
  subjects?: (TeacherSubject & { subject: Subject })[];
  work_hours?: TeacherWorkHours;
}

export interface AvailabilityDay {
  date: string;
  available_slots: {
    id: string;
    start: string;
    end: string;
    is_available: boolean;
  }[];
}

export interface StudentProfile extends BaseEntity {
  user_id: string;
  learning_goals?: string[];
  interests?: string[];
  age?: number;
}

export interface TeacherProfile extends BaseEntity {
  user_id: string;
  education: string[];
  experience: string;
  expertise_areas?: string[];
  hourly_rate: number;
  tax_id?: string;
}

export type StudentProfileInsert = Omit<StudentProfile, 'id' | 'created_at' | 'updated_at'>;
export type StudentProfileUpdate = Partial<StudentProfileInsert>;

export type TeacherProfileInsert = Omit<TeacherProfile, 'id' | 'created_at' | 'updated_at'>;
export type TeacherProfileUpdate = Partial<TeacherProfileInsert>; 