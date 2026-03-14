const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Fix the JSX structure by finding the exact location and adding missing closing tags
const lines = content.split('\n');
const newLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Add the line as-is
  newLines.push(line);
  
  // After the individual ID sections close, add the missing div closing
  if (line.includes('                      )}')) {
    // Check if the next line is the Preview section
    const nextLine = lines[i + 1] || '';
    if (nextLine.includes('                  {/* Preview All Uploaded IDs */}')) {
      newLines.push('                    </div>');
      newLines.push('                  )}');
    }
  }
}

content = newLines.join('\n');
fs.writeFileSync('src/app/page.tsx', content);
console.log('Fixed JSX structure');
