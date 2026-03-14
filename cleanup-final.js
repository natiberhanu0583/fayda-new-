const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Remove the leftover broken sections
const lines = content.split('\n');
const newLines = [];
let inOldSection = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Skip the broken section starting with the stray paragraph
  if (line.includes('<p className="text-slate-500">Click &quot;Add ID Card&quot; to start adding multiple ID cards</p>')) {
    inOldSection = true;
    continue;
  }
  
  // Skip until we find the end of the old section
  if (inOldSection) {
    if (line.includes('                  {/* Preview All Uploaded IDs */}')) {
      inOldSection = false;
      newLines.push(line); // Keep the preview section
    }
    continue;
  }
  
  newLines.push(line);
}

content = newLines.join('\n');
fs.writeFileSync('src/app/page.tsx', content);
console.log('Cleaned up remaining duplicate sections');
