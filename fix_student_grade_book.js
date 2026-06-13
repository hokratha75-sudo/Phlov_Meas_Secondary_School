const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'artifacts/admin/src/pages/StudentGradeBook.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Global replaces
content = content.replace(/bg-slate-50/g, 'bg-slate-50 dark:bg-gray-900/50');
content = content.replace(/bg-slate-100/g, 'bg-slate-100 dark:bg-gray-800/80');
content = content.replace(/border-slate-100/g, 'border-slate-100 dark:border-gray-700/50');
content = content.replace(/border-slate-200/g, 'border-slate-200 dark:border-gray-700');
content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-gray-400');
content = content.replace(/text-slate-400/g, 'text-slate-400 dark:text-gray-500');

// Clean up any duplicates if they exist
content = content.replace(/(dark:bg-gray-\d+(?:\/\d+)?)\s+\1/g, '$1');
content = content.replace(/(dark:border-gray-\d+(?:\/\d+)?)\s+\1/g, '$1');
content = content.replace(/(dark:text-gray-\d+)\s+\1/g, '$1');

// Fix focus:bg-white
content = content.replace(/focus:bg-white/g, 'focus:bg-white dark:focus:bg-gray-800');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed StudentGradeBook.tsx');
