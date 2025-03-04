import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { Database } from '../types/database';

dotenv.config();

// Function to check schema consistency between TypeScript types and database
async function checkSchemaConsistency() {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);
  
  console.log('🔍 Checking schema consistency...');
  
  // Get tables from the database
  const { data: dbTables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE');
    
  if (tablesError) {
    console.error('Error fetching tables:', tablesError);
    return;
  }
  
  // Get TypeScript types
  const tsTypes = Object.keys(Database.public.Tables);
  
  // Compare tables
  const dbTableNames = dbTables.map(t => t.table_name);
  const missingInTs = dbTableNames.filter(t => !tsTypes.includes(t));
  const missingInDb = tsTypes.filter(t => !dbTableNames.includes(t));
  
  if (missingInTs.length > 0) {
    console.warn('⚠️ Tables in database but missing in TypeScript types:', missingInTs);
  }
  
  if (missingInDb.length > 0) {
    console.warn('⚠️ Tables in TypeScript types but missing in database:', missingInDb);
  }
  
  // Check column consistency for each table
  for (const tableName of dbTableNames) {
    if (!tsTypes.includes(tableName)) continue;
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
      
    if (columnsError) {
      console.error(`Error fetching columns for ${tableName}:`, columnsError);
      continue;
    }
    
    const tsColumns = Object.keys(Database.public.Tables[tableName].Row);
    const dbColumnNames = columns.map(c => c.column_name);
    
    const missingInTsColumns = dbColumnNames.filter(c => !tsColumns.includes(c));
    const missingInDbColumns = tsColumns.filter(c => !dbColumnNames.includes(c));
    
    if (missingInTsColumns.length > 0) {
      console.warn(`⚠️ Columns in database table ${tableName} but missing in TypeScript types:`, missingInTsColumns);
    }
    
    if (missingInDbColumns.length > 0) {
      console.warn(`⚠️ Columns in TypeScript types for table ${tableName} but missing in database:`, missingInDbColumns);
    }
  }
  
  console.log('✅ Schema consistency check completed!');
}

checkSchemaConsistency()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Error:', err)); 