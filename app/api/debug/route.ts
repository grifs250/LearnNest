import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Debug endpoint to check database contents
 * This is for development only and should be removed in production
 */
export async function GET() {
  try {
    const supabase = await createAdminClient();
    
    // Query all tables with structure
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('schemaname', 'public');
    
    if (tablesError) {
      return NextResponse.json({
        success: false,
        error: tablesError,
        message: 'Error fetching tables'
      }, { status: 500 });
    }
    
    // Get data from core tables
    const results: Record<string, any> = { tables };
    
    // Check subjects table
    try {
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('*');
      
      results.subjects = {
        data: subjects,
        error: subjectsError,
        count: subjects?.length || 0
      };
    } catch (e) {
      results.subjects = { error: e };
    }
    
    // Check categories table
    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*');
      
      results.categories = {
        data: categories,
        error: categoriesError,
        count: categories?.length || 0
      };
    } catch (e) {
      results.categories = { error: e };
    }
    
    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error,
      message: 'Unexpected error'
    }, { status: 500 });
  }
} 