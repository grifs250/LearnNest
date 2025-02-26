import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/profile';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      await supabase.auth.exchangeCodeForSession(code);
      
      // Get the session to verify it worked
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return NextResponse.redirect(
          new URL(`/login?error=no_session`, requestUrl.origin)
        );
      }

      // Successful login, redirect to the intended page
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch (error) {
      console.error('Callback error:', error);
      return NextResponse.redirect(
        new URL(`/login?error=callback_error`, requestUrl.origin)
      );
    }
  }

  // No code, redirect to login
  return NextResponse.redirect(
    new URL('/login?error=missing_code', requestUrl.origin)
  );
} 