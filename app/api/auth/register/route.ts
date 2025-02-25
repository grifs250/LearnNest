import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Valid roles
const VALID_ROLES = ['skolēns', 'pasniedzējs'] as const;
type ValidRole = typeof VALID_ROLES[number];

// Validate role
function isValidRole(role: any): role is ValidRole {
  return VALID_ROLES.includes(role);
}

export async function POST(request: Request) {
  try {
    const { email, password, full_name, role } = await request.json();
    
    // Input validation
    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: 'Lūdzu, aizpildiet visus obligātos laukus' },
        { status: 400 }
      );
    }

    // Role validation
    if (!isValidRole(role)) {
      return NextResponse.json(
        { error: 'Nederīga loma. Lūdzu izvēlieties: Skolēns vai Pasniedzējs' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Create user in Supabase Auth with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role: role === 'pasniedzējs' ? 'teacher' : 'student',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      // Return user-friendly error messages
      const errorMessage = authError.message === 'User already registered'
        ? 'Šis e-pasts jau ir reģistrēts'
        : 'Kļūda reģistrācijas laikā. Lūdzu, mēģiniet vēlreiz';
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({
      user: authData.user,
      message: 'Reģistrācija veiksmīga! Lūdzu pārbaudiet savu e-pastu.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Sistēmas kļūda. Lūdzu, mēģiniet vēlreiz vēlāk.' },
      { status: 500 }
    );
  }
} 