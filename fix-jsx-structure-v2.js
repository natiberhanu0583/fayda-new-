const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Find the Input element and add missing closing div before it
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Look for the Input element that needs closing div
  if (line.includes('                            <Input') && i > 0) {
    // Check if previous line has the closing div
    const prevLine = lines[i-1] || '';
    if (!prevLine.includes('</div>')) {
      // Add missing closing div
      lines.splice(i, 0, '                            </div>');
      console.log('Added missing closing div before Input at line', i + 1);
      break;
    }
  }
}

content = lines.join('\n');
fs.writeFileSync('src/app/page.tsx', content);
console.log('Fixed JSX structure for drag and drop');
