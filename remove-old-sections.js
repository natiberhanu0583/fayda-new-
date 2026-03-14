const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Find and remove the old screenshot sections that are causing duplicates
const lines = content.split('\n');
const newLines = [];
let skipLines = false;
let skipCount = 0;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if we're entering the old section we want to remove
  if (line.includes('{multiScreenshotSets.length === 0 ? (')) {
    skipLines = true;
    braceCount = 0;
    console.log('Found start of old section at line', i + 1);
    continue;
  }
  
  if (skipLines) {
    // Count braces to know when the section ends
    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;
    
    // When we've closed all braces, we're done skipping
    if (braceCount <= 0) {
      skipLines = false;
      console.log('Found end of old section at line', i + 1, 'skipped', skipCount, 'lines');
      continue;
    }
    
    skipCount++;
    continue;
  }
  
  newLines.push(line);
}

content = newLines.join('\n');
fs.writeFileSync('src/app/page.tsx', content);
console.log('Removed old screenshot sections successfully');
