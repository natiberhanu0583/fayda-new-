const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Find and replace the exact pattern with proper whitespace
const targetPattern = '                      )}\n\n                  {/* Preview All Uploaded IDs */}';
const replacementPattern = '                      )}\n                    </div>\n                  )}\n\n                  {/* Preview All Uploaded IDs */}';

// Try to find and replace the pattern
const index = content.indexOf(targetPattern);
if (index !== -1) {
  content = content.substring(0, index) + replacementPattern + content.substring(index + targetPattern.length);
  fs.writeFileSync('src/app/page.tsx', content);
  console.log('Successfully added missing closing tags');
} else {
  console.log('Pattern not found. Let me try a different approach...');
  
  // Find the line with "                      )}" and add closing tags after it
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '                      )}') {
      // Insert the missing closing tags
      lines.splice(i + 1, 0, '                    </div>');
      lines.splice(i + 2, 0, '                  )}');
      break;
    }
  }
  
  content = lines.join('\n');
  fs.writeFileSync('src/app/page.tsx', content);
  console.log('Added missing closing tags using line insertion');
}
