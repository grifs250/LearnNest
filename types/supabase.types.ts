import { BookingStatus } from '@/features/bookings/types';
import { Database } from './database.types';

export type TablesDefinition = {
  lessons: {
    Row: {
      id: string;
      subject: string;
      description?: string;
      teacherId: string;
      teacherName: string;
      subjectId: string;
      category?: string;
      price?: number;
      duration?: number;
      createdAt?: string;
      updatedAt?: string;
      bookedTimes: {
        [timeSlot: string]: {
          studentId: string;
          status: BookingStatus;
        };
      };
    };
  };
  users: {
    Row: {
      id: string;
      email: string;
      fullName: string;
      role: 'student' | 'teacher';
      workHours?: {
        [date: string]: string[];
      };
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          avatar_url?: string;
          bio?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          avatar_url?: string;
          bio?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          avatar_url?: string;
          bio?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          role: 'student' | 'teacher' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: 'student' | 'teacher' | 'admin';
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'student' | 'teacher' | 'admin';
        };
      };
      lessons: {
        Row: {
          id: string;
          title: string;
          description: string;
          subject_id: string;
          teacher_id: string;
          price_per_hour: number;
          duration_minutes: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          subject_id: string;
          teacher_id: string;
          price_per_hour: number;
          duration_minutes: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          subject_id?: string;
          teacher_id?: string;
          price_per_hour?: number;
          duration_minutes?: number;
          is_active?: boolean;
        };
      };
      lesson_schedules: {
        Row: {
          id: string;
          lesson_id: string;
          start_time: string;
          end_time: string;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          start_time: string;
          end_time: string;
          is_available?: boolean;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
        };
      };
      bookings: {
        Row: {
          id: string;
          student_id: string;
          schedule_id: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          schedule_id: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
        };
        Update: {
          id?: string;
          student_id?: string;
          schedule_id?: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          student_id: string;
          rating: number;
          comment: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          student_id: string;
          rating: number;
          comment: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          student_id?: string;
          rating?: number;
          comment?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          booking_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          user_id: string;
          content: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          user_id?: string;
          content?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description?: string;
          parent_id?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string;
          parent_id?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          parent_id?: string;
          is_active?: boolean;
        };
      };
      teacher_subjects: {
        Row: {
          id: string;
          teacher_id: string;
          subject_id: string;
          experience_years: number;
          hourly_rate: number;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          subject_id: string;
          experience_years: number;
          hourly_rate: number;
          is_verified?: boolean;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          subject_id?: string;
          experience_years?: number;
          hourly_rate?: number;
          is_verified?: boolean;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          is_read?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          is_read?: boolean;
        };
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: unknown;
    };
    Enums: {
      user_role: 'student' | 'teacher' | 'admin';
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
    };
  };
};
