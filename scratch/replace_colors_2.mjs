import fs from 'fs';
import path from 'path';

const searchDirs = [
  path.resolve('artifacts/admin'),
  path.resolve('artifacts/school-website'),
];

const extensions = ['.tsx', '.ts', '.html', '.css'];

const replacements = [
  { regex: /border-t-\[\#1e3a6e\]/g, replacement: 'border-t-primary' },
  { regex: /border-l-\[\#1e3a6e\]/g, replacement: 'border-l-primary' },
  { regex: /from-\[\#1e3a6e\]/g, replacement: 'from-primary' },
  { regex: /to-\[\#1e3a6e\]/g, replacement: 'to-primary' },
  { regex: /to-\[\#2d5a8e\]/g, replacement: 'to-primary/80' },
  { regex: /hover:to-\[\#2d5a8e\]/g, replacement: 'hover:to-primary/90' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== 'dev-dist') {
        processDirectory(fullPath);
      }
    } else if (extensions.includes(path.extname(fullPath))) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  for (const { regex, replacement } of replacements) {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Modified: ${filePath}`);
  }
}

searchDirs.forEach(processDirectory);
console.log('Second pass complete.');
