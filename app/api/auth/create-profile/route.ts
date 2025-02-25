import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: Request) {
  const { userId, full_name, role } = await req.json();

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      full_name,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ profile: data });
} 