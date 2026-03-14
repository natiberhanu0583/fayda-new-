const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Find and remove the "Add ID Card" button section
const lines = content.split('\n');
const newLines = [];
let skipSection = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Start skipping when we find the Add ID Card section
  if (line.includes('<div className="flex justify-between items-center">')) {
    skipSection = true;
    continue;
  }
  
  // Stop skipping when we find the next section after it
  if (skipSection && line.includes('                      {/* Quick Add Buttons */}')) {
    skipSection = false;
    newLines.push(line);
    continue;
  }
  
  // Skip all lines in the Add ID Card section
  if (!skipSection) {
    newLines.push(line);
  }
}

content = newLines.join('\n');
fs.writeFileSync('src/app/page.tsx', content);
console.log('Removed Add ID Card button section');
