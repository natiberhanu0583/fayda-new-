const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Add the missing closing div tag before the Preview Section
content = content.replace(
  '            </div>\n\n\n            {/* Preview Section - Results List */}',
  '            </div>\n          </div>\n\n            {/* Preview Section - Results List */}'
);

fs.writeFileSync('src/app/page.tsx', content);
console.log('Added missing closing div tag');
