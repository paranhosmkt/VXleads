const fs = require('fs');
let code = fs.readFileSync('src/pages/TVMode.tsx', 'utf-8');

code = code.replace(
  /const \[bgImageUrl, setBgImageUrl\] = useState\(''\);/,
  "const [bgImageUrl, setBgImageUrl] = useState('');\n  const [fontFamily, setFontFamily] = useState('Inter');\n  const [textColor, setTextColor] = useState('#FFFFFF');"
);

fs.writeFileSync('src/pages/TVMode.tsx', code);
