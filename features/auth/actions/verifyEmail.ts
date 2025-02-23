import { supabase } from '@/lib/supabase/client';

export const verifyEmail = async (email: string, token: string) => {
  const { error } = await supabase.auth.verifyOtp({
    type: 'email_change',
    token,
    email,
  });

  if (error) throw error;
  return true;
}; 