const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Find and replace the exact pattern
const targetPattern = '                      )}\n\n                  {/* Preview All Uploaded IDs */}';
const replacementPattern = '                      )}\n                    </div>\n                  )}\n\n                  {/* Preview All Uploaded IDs */}';

if (content.includes(targetPattern)) {
  content = content.replace(targetPattern, replacementPattern);
  fs.writeFileSync('src/app/page.tsx', content);
  console.log('Successfully added missing closing tags');
} else {
  console.log('Target pattern not found. Let me check what we have...');
  
  // Show the actual content around that area
  const lines = content.split('\n');
  for (let i = 850; i < 860 && i < lines.length; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
