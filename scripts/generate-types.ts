import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const generateTypes = () => {
  try {
    // Ensure the types directory exists
    const typesDir = path.join(process.cwd(), 'types');
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir);
    }

    // Generate types using Supabase CLI
    const command = `npx supabase gen types typescript --project-id "${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}" --schema public > types/supabase.types.ts`;
    execSync(command, { stdio: 'inherit' });

    console.log('✅ Successfully generated Supabase types');
  } catch (error) {
    console.error('❌ Error generating types:', error);
    process.exit(1);
  }
};

generateTypes(); 