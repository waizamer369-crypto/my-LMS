const fs = require('fs');
const path = require('path');

function fixImports(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      fixImports(fullPath);
    } else if (file.name.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Fix relative imports without extension
      content = content.replace(/from\s+['"](\.{1,2}\/[^'"]+?)['"]/g, (match, importPath) => {
        // Skip if already has extension
        if (/\.[a-zA-Z]{2,4}$/.test(importPath)) return match;

        const importerDir = path.dirname(fullPath);
        const resolved = path.resolve(importerDir, importPath);

        // Check if it's a file
        if (fs.existsSync(resolved + '.ts')) {
          changed = true;
          return `from '${importPath}.ts'`;
        }
        // Check if it's a directory with index.ts
        if (fs.existsSync(path.join(resolved, 'index.ts'))) {
          changed = true;
          return `from '${importPath}/index.ts'`;
        }

        return match;
      });

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed:', fullPath);
      }
    }
  }
}

fixImports('./server');
console.log('Done! All imports fixed.');