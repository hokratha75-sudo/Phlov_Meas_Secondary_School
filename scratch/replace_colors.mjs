import fs from 'fs';
import path from 'path';

const searchDirs = [
  path.resolve('artifacts/admin'),
  path.resolve('artifacts/school-website'),
];

const extensions = ['.tsx', '.ts', '.html', '.css'];

// Define replacements
const replacements = [
  // Tailwind classes
  { regex: /text-\[\#1e3a6e\]/g, replacement: 'text-primary' },
  { regex: /bg-\[\#1e3a6e\]/g, replacement: 'bg-primary' },
  { regex: /border-\[\#1e3a6e\]/g, replacement: 'border-primary' },
  { regex: /ring-\[\#1e3a6e\]/g, replacement: 'ring-primary' },
  { regex: /fill-\[\#1e3a6e\]/g, replacement: 'fill-primary' },
  { regex: /stroke-\[\#1e3a6e\]/g, replacement: 'stroke-primary' },
  { regex: /shadow-\[\#1e3a6e\]/g, replacement: 'shadow-primary' },
  
  // Hover/Focus states for primary
  { regex: /hover:text-\[\#1e3a6e\]/g, replacement: 'hover:text-primary' },
  { regex: /hover:border-\[\#1e3a6e\]/g, replacement: 'hover:border-primary' },
  { regex: /focus:border-\[\#1e3a6e\]/g, replacement: 'focus:border-primary' },
  { regex: /focus:ring-\[\#1e3a6e\]/g, replacement: 'focus:ring-primary' },
  
  // Hover backgrounds
  { regex: /hover:bg-\[\#2d5a8e\]/g, replacement: 'hover:opacity-90' },
  { regex: /hover:bg-\[\#152a53\]/g, replacement: 'hover:opacity-90' },
  
  // Inline styles and SVG attributes
  { regex: /stroke="\#1e3a6e"/g, replacement: 'stroke="var(--color-primary)"' },
  { regex: /stopColor="\#1e3a6e"/g, replacement: 'stopColor="var(--color-primary)"' },
  { regex: /color="\#1e3a6e"/g, replacement: 'color="var(--color-primary)"' },
  { regex: /fill="\#1e3a6e"/g, replacement: 'fill="var(--color-primary)"' },
  
  // Generic CSS
  { regex: /color:\s*\#1e3a6e/g, replacement: 'color: var(--color-primary)' },
  { regex: /background-color:\s*\#1e3a6e/g, replacement: 'background-color: var(--color-primary)' },
  { regex: /background:\s*\#1e3a6e/g, replacement: 'background: var(--color-primary)' },
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

let modifiedCount = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  for (const { regex, replacement } of replacements) {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      modified = true;
    }
  }

  // Also catch generic `#1e3a6e` inside meta tags
  if (filePath.endsWith('index.html')) {
    if (content.includes('name="theme-color"') && !content.includes('id="theme-color-meta"')) {
      content = content.replace('<meta name="theme-color" content="#1e3a6e" />', '<meta id="theme-color-meta" name="theme-color" content="#1e3a6e" />');
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Modified: ${filePath}`);
    modifiedCount++;
  }
}

searchDirs.forEach(processDirectory);
console.log(`Done. Modified ${modifiedCount} files.`);
