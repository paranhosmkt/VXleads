const fs = require('fs');

const source = fs.readFileSync('src/i18n.ts', 'utf-8');
const resourcesMatch = source.match(/const resources = (\{[\s\S]*?\}|.*);[\s\S]*?i18n/);
if (!resourcesMatch) {
  console.log("Could not parse resources");
  process.exit(1);
}
// We can't easily eval it if it's not valid JSON, but let's just grep for keys instead.
