import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Admin-only endpoint to test database access using service role
 * This route bypasses Row Level Security (RLS)
 */
export async function GET() {
  try {
    // Create admin client (uses service role)
    const supabase = await createAdminClient();
    
    // Fetch a few profiles to test connection
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, user_id')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Error in admin-check:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message} (Code: ${error.code})` },
        { status: 500 }
      );
    }
    
    // Return success with profile count and data
    return NextResponse.json({
      success: true,
      message: `Successfully fetched ${data.length} profiles`,
      data
    });
  } catch (error) {
    console.error('Unexpected error in admin-check:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 