const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all API routes with dynamic parameters
const files = glob.sync('./app/api/**/[*]/**/route.ts');

console.log('Found', files.length, 'API route files to fix');

files.forEach(file => {
  console.log('Fixing:', file);
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix the params type declaration - make it Promise
  content = content.replace(
    /\{ params \}: \{ params: \{ ([^}]+) \} \}/g,
    '{ params }: { params: Promise<{ $1 }> }'
  );
  
  // Fix params usage - add await
  content = content.replace(
    /params\.([a-zA-Z_][a-zA-Z0-9_]*)/g,
    '(await params).$1'
  );
  
  fs.writeFileSync(file, content);
});

console.log('✅ Fixed all API routes for Next.js 15 compatibility');
