const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Find the exact line with the condition and modify it carefully
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('isMultiScreenshotMode && multiScreenshotSets.some(set => set.some(file => file !== null)) && (')) {
    // Replace just this line to disable the preview
    lines[i] = lines[i].replace(
      'isMultiScreenshotMode && multiScreenshotSets.some(set => set.some(file => file !== null)) && (',
      'false && ( // Disabled: isMultiScreenshotMode && multiScreenshotSets.some(set => set.some(file => file !== null)) && ('
    );
    break;
  }
}

content = lines.join('\n');
fs.writeFileSync('src/app/page.tsx', content);
console.log('Preview section disabled safely');
