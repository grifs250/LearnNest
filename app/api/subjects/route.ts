import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase/client';
import { Subject } from '@/lib/types';
// Check if the admin file exists and import it correctly
// import { adminFunction } from '@/lib/firebase/admin'; // Uncomment and correct if needed

export async function GET(request: NextRequest) {
  try {
    // Get the category ID from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    
    // Set up the query
    let query = supabase.from('subjects').select('*')
      .eq('is_active', true)
      .order('name');
    
    // Add the category filter if it exists
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching subjects:', error);
      return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
    }
    
    return NextResponse.json({ subjects: data as Subject[] });
  } catch (error) {
    console.error('Unexpected error in subjects API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 