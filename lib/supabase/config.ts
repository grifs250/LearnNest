export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  jwtSecret: process.env.SUPABASE_JWT_SECRET!,
  storageUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1`,
  databaseUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`,
}; 