import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Valid roles
const VALID_ROLES = ['skolēns', 'pasniedzējs'] as const;
type ValidRole = typeof VALID_ROLES[number];

// Validate role
function isValidRole(role: any): role is ValidRole {
  return VALID_ROLES.includes(role);
}

// Validation schema for registration payload
const registrationSchema = z.object({
  email: z.string().email('Nederīgs e-pasta formāts'),
  password: z.string().min(6, 'Parolei jābūt vismaz 6 rakstzīmes garai'),
  full_name: z.string().min(2, 'Vārdam jābūt vismaz 2 rakstzīmes garam'),
  role: z.enum(['student', 'teacher'], {
    invalid_type_error: 'Nederīga loma',
    required_error: 'Loma ir obligāta',
  }),
});

export async function POST(request: Request) {
  try {
    // Get request data and validate
    const body = await request.json();
    const validationResult = registrationSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
      return NextResponse.json(
        { error: errorMessages },
        { status: 400 }
      );
    }

    const { email, password, full_name, role } = validationResult.data;
    const requestUrl = new URL(request.url);
    
    // Initialize Supabase client with cookie store
    const supabase = createRouteHandlerClient({ 
      cookies
    });

    // First check if email exists in auth
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Šis e-pasts jau ir izmantots. Lūdzu lietojiet citu e-pastu.' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role,
        },
        emailRedirectTo: `${requestUrl.origin}/callback?next=/verify-email`,
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Kļūda reģistrācijas laikā. Lūdzu, mēģiniet vēlreiz.' },
        { status: 400 }
      );
    }

    if (!authData.user?.id) {
      return NextResponse.json(
        { error: 'Kļūda veidojot lietotāju. Lūdzu mēģiniet vēlreiz.' },
        { status: 400 }
      );
    }

    // Create initial profile in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          full_name,
          role,
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't delete the auth user since the email verification is already sent
      return NextResponse.json({
        user: authData.user,
        message: 'Konts izveidots. Pārbaudiet e-pastu.',
        type: 'success'
      });
    }

    // Return success response
    return NextResponse.json({
      user: authData.user,
      message: 'Konts izveidots. Pārbaudiet e-pastu.',
      type: 'success'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Kļūda. Lūdzu mēģiniet vēlreiz.' },
      { status: 500 }
    );
  }
} 