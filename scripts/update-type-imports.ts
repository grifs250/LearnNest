import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const updateImports = () => {
  try {
    // Find all TypeScript files
    const files = execSync('git ls-files "*.ts" "*.tsx"', { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);

    // Update patterns
    const patterns = [
      {
        from: /@\/types\/database/g,
        to: '@/lib/types'
      },
      {
        from: /@\/types\/supabase\.types/g,
        to: '@/lib/types'
      },
      {
        from: /@\/types\/supabase/g,
        to: '@/lib/types'
      },
      {
        from: /@\/types\/models/g,
        to: '@/lib/types'
      }
    ];

    // Process each file
    files.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      let content = fs.readFileSync(filePath, 'utf-8');
      let hasChanges = false;

      patterns.forEach(({ from, to }) => {
        const newContent = content.replace(from, to);
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated imports in ${file}`);
      }
    });

    console.log('✅ Successfully updated type imports');
  } catch (error) {
    console.error('❌ Error updating type imports:', error);
  }
};

updateImports(); 