const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Find the exact line numbers where we need to add closing tags
const lines = content.split('\n');

// Find the line with "                      )}" that needs closing div
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('                      )}')) {
    // Check if next line is the Preview section
    if (i + 1 < lines.length && lines[i + 1].includes('                  {/* Preview All Uploaded IDs */}')) {
      // Insert the missing closing tags
      lines.splice(i + 1, 0, '                    </div>');
      lines.splice(i + 2, 0, '                  )}');
      break;
    }
  }
}

content = lines.join('\n');
fs.writeFileSync('src/app/page.tsx', content);
console.log('Fixed JSX structure with proper closing tags');
