const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Simply change the condition to always be false
content = content.replace(
  'isMultiScreenshotMode && multiScreenshotSets.some(set => set.some(file => file !== null))',
  'false // isMultiScreenshotMode && multiScreenshotSets.some(set => set.some(file => file !== null)) - HIDDEN'
);

fs.writeFileSync('src/app/page.tsx', content);
console.log('Preview section disabled by setting condition to false');
