import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
// Check if the admin file exists and import it correctly
// import { adminFunction } from '@/lib/firebase/admin'; // Uncomment and correct if needed

export async function GET(req: Request) {
  try {
    const { data: subjects, error } = await supabase.from('subjects').select('*');

    if (error) {
      throw error;
    }

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
} 