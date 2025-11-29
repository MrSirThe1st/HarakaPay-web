#!/usr/bin/env node

/**
 * Script to update all API routes from old auth-helpers to new @supabase/ssr
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/api/schools/settings/route.ts',
  'src/app/api/students/levels/route.ts',
  'src/app/api/school/fees/structures/route.ts',
  'src/app/api/school/staff/route.ts',
  'src/app/api/notifications/send/route.js',
  'src/app/api/notifications/history/route.js',
  'src/app/api/notifications/scheduled/route.js',
  'src/app/api/notifications/scheduled/[id]/route.js',
];

const oldImport = `import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';`;
const newImport = `import { createServerClient } from '@supabase/ssr';`;

const oldAuthPattern = /const supabase = createRouteHandlerClient(?:<[^>]+>)?\(\s*\{\s*cookies\s*\}\s*\);/g;

const newAuthCode = `const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // Cookie setting might fail in some contexts
            }
          },
          remove(name, options) {
            try {
              cookieStore.set({ name, value: '', ...options, maxAge: 0 });
            } catch {
              // Cookie removal might fail
            }
          },
        },
      }
    );`;

let fixedCount = 0;
let errorCount = 0;

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    errorCount++;
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace import
    if (content.includes(oldImport)) {
      content = content.replace(oldImport, newImport);
      modified = true;
    }

    // Replace auth pattern
    if (oldAuthPattern.test(content)) {
      content = content.replace(oldAuthPattern, newAuthCode);
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    } else {
      console.log(`ℹ️  No changes needed: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
    errorCount++;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`✅ Fixed: ${fixedCount} files`);
console.log(`❌ Errors: ${errorCount} files`);
console.log('='.repeat(50));
