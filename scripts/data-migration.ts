import * as dotenv from 'dotenv';
import { createSupabaseAdminClient } from '../lib/supabase/admin';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Migrate categories from one structure to another
 */
async function migrateCategories() {
  const supabase = createSupabaseAdminClient();
  console.log('Migrating categories...');
  
  try {
    // Fetch all categories
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${categories.length} categories to migrate`);
    
    // Process each category
    for (const category of categories) {
      console.log(`Processing category: ${category.name}`);
      
      // Add any migration logic here
      // For example, updating the structure or adding new fields
      
      // Update the category with new data
      const { error: updateError } = await supabase
        .from('categories')
        .update({
          updated_at: new Date().toISOString(),
          // Add other fields to update
        })
        .eq('id', category.id);
        
      if (updateError) {
        console.error(`Failed to update category ${category.id}:`, updateError);
      }
    }
    
    console.log('Categories migration completed');
  } catch (error) {
    console.error('Error migrating categories:', error);
  }
}

/**
 * Migrate subjects to the new data structure
 */
async function migrateSubjects() {
  const supabase = createSupabaseAdminClient();
  console.log('Migrating subjects...');
  
  try {
    // Fetch all subjects
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${subjects.length} subjects to migrate`);
    
    // Process each subject
    for (const subject of subjects) {
      console.log(`Processing subject: ${subject.name}`);
      
      // Update the subject with new data
      const { error: updateError } = await supabase
        .from('subjects')
        .update({
          updated_at: new Date().toISOString(),
          is_active: true,
          // Add other fields to update
        })
        .eq('id', subject.id);
        
      if (updateError) {
        console.error(`Failed to update subject ${subject.id}:`, updateError);
      }
    }
    
    console.log('Subjects migration completed');
  } catch (error) {
    console.error('Error migrating subjects:', error);
  }
}

/**
 * Migrate profiles to the new data structure
 */
async function migrateProfiles() {
  const supabase = createSupabaseAdminClient();
  console.log('Migrating profiles...');
  
  try {
    // Fetch all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${profiles.length} profiles to migrate`);
    
    // Process each profile
    for (const profile of profiles) {
      console.log(`Processing profile: ${profile.full_name || profile.id}`);
      
      // Update the profile with new data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          updated_at: new Date().toISOString(),
          is_active: true,
          // Add other fields to update
        })
        .eq('id', profile.id);
        
      if (updateError) {
        console.error(`Failed to update profile ${profile.id}:`, updateError);
      }
    }
    
    console.log('Profiles migration completed');
  } catch (error) {
    console.error('Error migrating profiles:', error);
  }
}

/**
 * Run all migrations
 */
async function runMigrations() {
  try {
    await migrateCategories();
    await migrateSubjects();
    await migrateProfiles();
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migrations
runMigrations().catch(console.error); 