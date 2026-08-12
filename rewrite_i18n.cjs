const fs = require('fs');

let code = fs.readFileSync('src/i18n.ts', 'utf-8');

// Find the start of "en": {
const enStart = code.indexOf(',\n  "en": {');
if (enStart !== -1) {
  const endResources = code.indexOf('};\n\ni18n');
  if (endResources !== -1) {
    code = code.substring(0, enStart) + '\n' + code.substring(endResources);
  }
}

// Remove LanguageDetector
code = code.replace("import LanguageDetector from 'i18next-browser-languagedetector';\n", "");
code = code.replace("  .use(LanguageDetector)\n", "");
code = code.replace("fallbackLng: 'pt',", "lng: 'pt',\n    fallbackLng: 'pt',");

fs.writeFileSync('src/i18n.ts', code);
console.log("Rewrote i18n.ts");
