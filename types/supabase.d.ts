// Add these type definitions to align with our updated schema
declare module '@/types/supabase' {
  export interface Database {
    public: {
      Tables: {
        profiles: {
          Row: {
            id: string; // Changed from UUID to string (varchar)
            user_id: string;
            full_name: string;
            email: string;
            avatar_url: string | null;
            role: 'student' | 'teacher' | 'admin';
            is_active: boolean;
            created_at: string;
            updated_at: string;
            metadata: Record<string, any> | null;
            bio: string | null;
            hourly_rate: number | null;
            learning_goals: string[] | null;
            // Additional fields
            phone: string | null;
            age: number | null;
            languages: string[] | null;
            education_documents: string[] | null;
            tax_id: string | null;
            personal_id: string | null;
            verification_status: string | null;
            stripe_customer_id: string | null;
            stripe_account_id: string | null;
            settings: Record<string, any> | null;
          };
          Insert: {
            id: string;
            user_id: string;
            full_name: string;
            email: string;
            avatar_url?: string | null;
            role?: 'student' | 'teacher' | 'admin';
            is_active?: boolean;
            created_at?: string;
            updated_at?: string;
            metadata?: Record<string, any> | null;
            // ... additional fields with optionals
          };
          Update: {
            id?: string;
            user_id?: string;
            full_name?: string;
            email?: string;
            avatar_url?: string | null;
            role?: 'student' | 'teacher' | 'admin';
            is_active?: boolean;
            updated_at?: string;
            metadata?: Record<string, any> | null;
            // ... additional fields with optionals
          };
        };
        // Update other table definitions as needed...
      };
    };
  }
} 