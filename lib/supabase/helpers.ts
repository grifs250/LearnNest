import { Database } from '@/types/supabase.types'
import { SupabaseClient } from '@supabase/supabase-js'

export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

type Profile = Tables['profiles']['Row']
type TeacherProfile = Tables['teacher_profiles']['Row']
type StudentProfile = Tables['student_profiles']['Row']
type Lesson = Tables['lessons']['Row']
type Booking = Tables['bookings']['Row']
type Message = Tables['messages']['Row']
type Review = Tables['reviews']['Row']
type Notification = Tables['notifications']['Row']

// Profile helpers
export async function getProfile(supabase: SupabaseClient<Database>, userId: string): Promise<Profile & { teacher_profiles: TeacherProfile | null, student_profiles: StudentProfile | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, teacher_profiles(*), student_profiles(*)')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

// Lesson helpers
export async function getLessons(supabase: SupabaseClient<Database>): Promise<(Lesson & { teacher_profiles: TeacherProfile & { profiles: Profile }, subjects: Tables['subjects']['Row'] })[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      teacher_profiles!inner(
        *,
        profiles(*)
      ),
      subjects(*)
    `)
    .eq('is_active', true)

  if (error) throw error
  return data
}

// Booking helpers
export async function createBooking(
  supabase: SupabaseClient<Database>,
  scheduleId: string,
  studentId: string,
  amount: number
): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      schedule_id: scheduleId,
      student_id: studentId,
      amount: amount,
      status: 'pending',
      payment_status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Message helpers
export async function getMessages(
  supabase: SupabaseClient<Database>,
  bookingId: string
): Promise<(Message & { profiles: Profile })[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      profiles(*)
    `)
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function sendMessage(
  supabase: SupabaseClient<Database>,
  bookingId: string,
  senderId: string,
  content: string
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      booking_id: bookingId,
      sender_id: senderId,
      content: content
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Review helpers
export async function createReview(
  supabase: SupabaseClient<Database>,
  bookingId: string,
  studentId: string,
  teacherId: string,
  rating: number,
  comment?: string
): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      booking_id: bookingId,
      student_id: studentId,
      teacher_id: teacherId,
      rating: rating,
      comment: comment,
      is_public: true
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Notification helpers
export async function getNotifications(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}

export async function markNotificationAsRead(
  supabase: SupabaseClient<Database>,
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
} 