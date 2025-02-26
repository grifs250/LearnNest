import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: {
          async getItem(key) {
            return cookieStore.get(key)?.value ?? null
          },
          async setItem(key, value) {
            cookieStore.set(key, value, { path: '/' })
          },
          async removeItem(key) {
            cookieStore.delete(key)
          }
        }
      }
    }
  )
} 