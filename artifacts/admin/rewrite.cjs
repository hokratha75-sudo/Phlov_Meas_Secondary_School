const fs = require('fs');
let code = fs.readFileSync('src/components/StudentIdCardStudio.tsx', 'utf8');

// Replace bg-[#0d2a59]
code = code.replace(/className="([^"]*)bg-\[\#0d2a59\]([^"]*)"/g, 'className="$1$2" style={{ backgroundColor: currentTheme.headerBg }}');

// Replace text-[#0d2a59]
code = code.replace(/className="([^"]*)text-\[\#0d2a59\]([^"]*)"/g, 'className="$1$2" style={{ color: currentTheme.headerBg }}');

// Replace text-yellow-400
code = code.replace(/className="([^"]*)text-yellow-400([^"]*)"/g, 'className="$1$2" style={{ color: currentTheme.titleColor }}');

// Replace bg-yellow-400
code = code.replace(/className="([^"]*)bg-yellow-400([^"]*)"/g, 'className="$1$2" style={{ backgroundColor: currentTheme.titleColor }}');

// Fix the text-white text-center classes that need to be textColor
code = code.replace(/className="text-\[7\.5px\] font-moul text-white text-center leading-tight whitespace-nowrap"/g, 'className="text-[7.5px] font-moul text-center leading-tight whitespace-nowrap" style={{ color: currentTheme.textColor }}');
code = code.replace(/className="text-\[10px\] font-moul text-white text-center mt-\[1px\]"/g, 'className="text-[10px] font-moul text-center mt-[1px]" style={{ color: currentTheme.textColor }}');
code = code.replace(/className="text-\[5\.5px\] font-bold text-white text-center mt-\[1px\]"/g, 'className="text-[5.5px] font-bold text-center mt-[1px]" style={{ color: currentTheme.textColor }}');
code = code.replace(/className="text-\[12px\] font-moul text-white text-center leading-tight whitespace-nowrap"/g, 'className="text-[12px] font-moul text-center leading-tight whitespace-nowrap" style={{ color: currentTheme.textColor }}');
code = code.replace(/className="text-\[16px\] font-moul text-white text-center mt-1"/g, 'className="text-[16px] font-moul text-center mt-1" style={{ color: currentTheme.textColor }}');
code = code.replace(/className="text-\[9px\] font-bold text-white text-center mt-1"/g, 'className="text-[9px] font-bold text-center mt-1" style={{ color: currentTheme.textColor }}');
code = code.replace(/className="text-white font-khmer text-\[5\.5px\] flex flex-col"/g, 'className="font-khmer text-[5.5px] flex flex-col" style={{ color: currentTheme.textColor }}');
code = code.replace(/className="text-white font-khmer text-\[5\.5px\] flex flex-col text-right"/g, 'className="font-khmer text-[5.5px] flex flex-col text-right" style={{ color: currentTheme.textColor }}');
code = code.replace(/className="text-white font-khmer text-\[8px\] flex flex-col"/g, 'className="font-khmer text-[8px] flex flex-col" style={{ color: currentTheme.textColor }}');
code = code.replace(/className="text-white font-khmer text-\[8px\] flex flex-col text-right"/g, 'className="font-khmer text-[8px] flex flex-col text-right" style={{ color: currentTheme.textColor }}');

// Clean up extra spaces in className
code = code.replace(/className=" +/g, 'className="');
code = code.replace(/ +"/g, '"');
code = code.replace(/  +/g, ' ');

fs.writeFileSync('src/components/StudentIdCardStudio.tsx', code);
console.log('Done replacing theme styles.');
