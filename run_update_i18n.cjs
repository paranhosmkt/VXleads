const fs = require('fs');
const i18nContent = fs.readFileSync('src/i18n.ts', 'utf-8');

// Just doing string replacements for simplicity
// We'll append the new sections into the pt, en, es objects.

const ptAdd = `,
      landing: require('./update_i18n_full.cjs').pt.landing,
      register: require('./update_i18n_full.cjs').pt.register`;

const enAdd = `,
      landing: require('./update_i18n_full.cjs').en.landing,
      register: require('./update_i18n_full.cjs').en.register`;

const esAdd = `,
      landing: require('./update_i18n_full.cjs').es.landing,
      register: require('./update_i18n_full.cjs').es.register`;

// Let's make update_i18n_full.cjs export the objects
const script = fs.readFileSync('update_i18n_full.cjs', 'utf-8');
fs.writeFileSync('update_i18n_full.cjs', script.replace('let i18nContent =', 'module.exports = { pt, en, es };\n//'));

let updated = i18nContent;
updated = updated.replace(/footer: \{[\s\S]*?\n\s*\}/g, match => match + ptAdd);
updated = updated.replace(/footer: \{[\s\S]*?\n\s*\}/g, match => match.includes('landing:') ? match : match + enAdd);
updated = updated.replace(/footer: \{[\s\S]*?\n\s*\}/g, match => match.includes('landing:') ? match : match + esAdd);

// The replaces are global but we want to apply to pt, en, es respectively.
// Safer way:
let parts = i18nContent.split('en: {');
let ptPart = parts[0];
let en_esPart = parts[1].split('es: {');
let enPart = en_esPart[0];
let esPart = en_esPart[1];

ptPart = ptPart.replace(/footer: \{[\s\S]*?\n\s*\}/, match => match + ptAdd);
enPart = enPart.replace(/footer: \{[\s\S]*?\n\s*\}/, match => match + enAdd);
esPart = esPart.replace(/footer: \{[\s\S]*?\n\s*\}/, match => match + esAdd);

fs.writeFileSync('src/i18n.ts', ptPart + 'en: {' + enPart + 'es: {' + esPart);
