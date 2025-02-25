import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const error_description = requestUrl.searchParams.get('error_description');

    // Handle error cases from Supabase auth
    if (error) {
      const errorMessage = encodeURIComponent(
        error === 'access_denied' && error_description?.includes('expired')
          ? 'verification_expired'
          : error
      );
      return NextResponse.redirect(
        new URL(`/login?error=${errorMessage}`, request.url)
      );
    }

    // Handle verification code
    if (code) {
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        const errorType = sessionError.message.includes('expired')
          ? 'verification_expired'
          : 'verification_failed';
        return NextResponse.redirect(
          new URL(`/login?error=${errorType}`, request.url)
        );
      }

      if (!session?.user) {
        return NextResponse.redirect(
          new URL('/login?error=no_session', request.url)
        );
      }

      // User is now verified and has a session
      return NextResponse.redirect(new URL('/profile/setup', request.url));
    }

    // No code provided
    return NextResponse.redirect(
      new URL('/login?error=invalid_request', request.url)
    );
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=system_error', request.url)
    );
  }
} 