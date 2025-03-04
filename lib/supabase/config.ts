// Supabase configuration
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

// Bucket names for file storage
export const buckets = {
  profiles: 'profile-images',
  lessons: 'lesson-materials',
  certificates: 'teacher-certificates',
  documents: 'educational-documents',
}; 