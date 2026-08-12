const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf-8');

code = code.replace(
  "event: 'https://buy.stripe.com/bJeaEXadZ5qf84bdyj6Zy02',",
  "event: 'https://buy.stripe.com/9B6aEXfyjbODfwD8dZ6Zy05_event',"
);

fs.writeFileSync('src/pages/Register.tsx', code);
console.log("Patched Register.tsx");
