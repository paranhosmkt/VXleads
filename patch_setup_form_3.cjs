const fs = require('fs');
let code = fs.readFileSync('src/pages/SetupForm.tsx', 'utf8');

code = code.replace(
  "      type: 'short_text',",
  "      type: 'multiple_choice',"
);

fs.writeFileSync('src/pages/SetupForm.tsx', code);
