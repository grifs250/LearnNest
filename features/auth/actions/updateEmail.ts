import { supabase } from '@/lib/supabase/client';

export const updateEmail = async (newEmail: string) => {
  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (error) throw error;
  return true;
}; 