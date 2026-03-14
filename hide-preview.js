const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Find and comment out the entire Preview section
const previewStart = '                  {/* Preview All Uploaded IDs */}';
const previewEnd = '                  )}';

const startIndex = content.indexOf(previewStart);
if (startIndex !== -1) {
  const endIndex = content.indexOf(previewEnd, startIndex) + previewEnd.length;
  const previewSection = content.substring(startIndex, endIndex);
  const commentedSection = previewSection.replace('isMultiScreenshotMode && multiScreenshotSets.some(set => set.some(file => file !== null)) && (', '/* isMultiScreenshotMode && multiScreenshotSets.some(set => set.some(file => file !== null)) && (').replace(')}', ')} */');
  
  content = content.substring(0, startIndex) + commentedSection + content.substring(endIndex);
  fs.writeFileSync('src/app/page.tsx', content);
  console.log('Successfully commented out Preview section');
} else {
  console.log('Preview section not found');
}
