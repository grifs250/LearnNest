import { createServerSupabaseClient } from '@/lib/utils/cookies';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const returnTo = requestUrl.searchParams.get('returnTo') || '/profile';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', requestUrl.origin));
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(
        new URL(`/login?error=auth_error&message=${error.message}`, requestUrl.origin)
      );
    }

    // Get session to check email verification
    const { data: { session } } = await supabase.auth.getSession();
    
    // If email is verified, redirect to profile
    if (session?.user.email_confirmed_at) {
      return NextResponse.redirect(new URL('/profile', requestUrl.origin));
    }

    // Otherwise redirect to verify-email page
    return NextResponse.redirect(new URL(returnTo, requestUrl.origin));
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=server_error', requestUrl.origin)
    );
  }
} 