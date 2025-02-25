import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  const { email, token } = await req.json();

  // Log the cookies for debugging
  console.log('Cookies:', req.cookies);

  const { error } = await supabase.auth.verifyOtp({
    token,
    type: 'email',
    email,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'Email verified successfully!' });
} 