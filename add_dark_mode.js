const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'artifacts/admin/src/pages');
const componentsPath = path.join(__dirname, 'artifacts/admin/src/components');

const replaceRules = [
    { pattern: /className="([^"]*\bbg-white\b[^"]*)"/g, replacement: (match, p1) => {
        if (!p1.includes('dark:bg-gray')) {
            return `className="${p1} dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"`;
        }
        return match;
    }},
    { pattern: /className="([^"]*\bbg-gray-50\b[^"]*)"/g, replacement: (match, p1) => {
        if (!p1.includes('dark:bg-gray')) {
            return `className="${p1} dark:bg-gray-900/50"`;
        }
        return match;
    }}
];

function processDirectory(dir) {
    fs.readdir(dir, (err, files) => {
        if (err) return console.log('Unable to scan directory: ' + err); 
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                processDirectory(filePath);
            } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
                let content = fs.readFileSync(filePath, 'utf8');
                let modified = false;

                replaceRules.forEach(rule => {
                    const original = content;
                    content = content.replace(rule.pattern, rule.replacement);
                    if (content !== original) modified = true;
                });

                if (modified) {
                    // Clean up potential duplicate dark classes
                    content = content.replace(/dark:bg-gray-[0-9]+(\/[0-9]+)? dark:bg-gray-[0-9]+(\/[0-9]+)?/g, 'dark:bg-gray-800');
                    content = content.replace(/dark:border-gray-[0-9]+ dark:border-gray-[0-9]+/g, 'dark:border-gray-700');
                    content = content.replace(/dark:text-gray-[0-9]+ dark:text-gray-[0-9]+/g, 'dark:text-gray-100');

                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`Updated ${filePath}`);
                }
            }
        });
    });
}

processDirectory(directoryPath);
processDirectory(componentsPath);
