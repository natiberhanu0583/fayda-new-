const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Find the specific pattern and remove it
const pattern = /{multiScreenshotSets\.length === 0 \? \([\s\S]*?\) : \([\s\S]*?\)\)}/g;
const match = content.match(pattern);

if (match) {
  console.log('Found pattern to remove:', match[0].substring(0, 100) + '...');
  content = content.replace(pattern, '');
  fs.writeFileSync('src/app/page.tsx', content);
  console.log('Successfully removed old screenshot sections');
} else {
  console.log('Pattern not found. Let me try a different approach...');
  
  // Try to find and remove the entire block
  const startIndex = content.indexOf('{multiScreenshotSets.length === 0 ? (');
  if (startIndex !== -1) {
    let endIndex = startIndex;
    let braceCount = 0;
    
    // Find the end of the block by counting braces
    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') braceCount--;
      
      if (braceCount === 0 && i > startIndex) {
        endIndex = i + 1;
        break;
      }
    }
    
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    content = before + after;
    
    fs.writeFileSync('src/app/page.tsx', content);
    console.log('Removed old screenshot sections using brace counting');
  } else {
    console.log('Could not find the section to remove');
  }
}
