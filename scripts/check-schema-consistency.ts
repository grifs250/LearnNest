import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import type { Database } from '../types/database';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

// Function to extract TypeScript table types from the database.ts file
function getTypeScriptTableTypes() {
  try {
    const content = readFileSync(join(process.cwd(), 'types', 'database.ts'), 'utf-8');
    
    // Extract table names using regex
    const tableInterfaceRegex = /interface\s+(\w+)\s+extends\s+BaseEntity/g;
    let match;
    const tableNames = [];
    
    while ((match = tableInterfaceRegex.exec(content)) !== null) {
      tableNames.push(match[1].toLowerCase());
    }
    
    return tableNames;
  } catch (error) {
    console.error('Error reading TypeScript types:', error);
    return [];
  }
}

// Function to check schema consistency between TypeScript types and database
async function checkSchemaConsistency() {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
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
  const tsTypes = getTypeScriptTableTypes();
  
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
  
  // Check columns for each table
  for (const tableName of dbTableNames) {
    if (!tsTypes.includes(tableName)) continue;
    
    // Get columns from database
    const { data: dbColumns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
      
    if (columnsError) {
      console.error(`Error fetching columns for ${tableName}:`, columnsError);
      continue;
    }
    
    try {
      // Extract TypeScript columns using regex
      const content = readFileSync(join(process.cwd(), 'types', 'database.ts'), 'utf-8');
      const tableSection = content.split(`interface ${tableName.charAt(0).toUpperCase() + tableName.slice(1)} extends BaseEntity`)[1];
      if (!tableSection) {
        console.warn(`⚠️ Could not find interface for ${tableName} in database.ts`);
        continue;
      }
      
      const endIndex = tableSection.indexOf('}');
      const tableProperties = tableSection.substring(0, endIndex);
      
      // Extract property names using regex
      const propertiesRegex = /(\w+):/g;
      let match: RegExpExecArray | null;
      const tsColumns: string[] = [];
      
      while ((match = propertiesRegex.exec(tableProperties)) !== null) {
        tsColumns.push(match[1]);
      }
      
      // Compare columns
      const dbColumnNames = dbColumns.map(c => c.column_name);
      const missingInTs = dbColumnNames.filter(c => !tsColumns.includes(c));
      const missingInDb = tsColumns.filter(c => !dbColumnNames.includes(c));
      
      if (missingInTs.length > 0) {
        console.warn(`⚠️ Columns in database table ${tableName} but missing in TypeScript:`, missingInTs);
      }
      
      if (missingInDb.length > 0) {
        console.warn(`⚠️ Columns in TypeScript type ${tableName} but missing in database:`, missingInDb);
      }
    } catch (error) {
      console.error(`Error comparing columns for ${tableName}:`, error);
    }
  }
  
  console.log('✅ Schema consistency check complete');
}

checkSchemaConsistency()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Error:', err)); 