const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('TermsOfUse')) {
  code = code.replace(
    "import Dashboard from './pages/Dashboard';",
    "import Dashboard from './pages/Dashboard';\nimport TermsOfUse from './pages/TermsOfUse';\nimport PrivacyPolicy from './pages/PrivacyPolicy';"
  );
  code = code.replace(
    '<Route path="/dashboard" element={<Dashboard />} />',
    '<Route path="/dashboard" element={<Dashboard />} />\n        <Route path="/termos-de-uso" element={<TermsOfUse />} />\n        <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />'
  );
  fs.writeFileSync('src/App.tsx', code);
}
