const fs = require('fs');
const i18nContent = fs.readFileSync('src/i18n.ts', 'utf-8');

const ptAdd = `,
      dashboard: require('./update_dashboard_i18n.cjs').pt.dashboard`;

const enAdd = `,
      dashboard: require('./update_dashboard_i18n.cjs').en.dashboard`;

const esAdd = `,
      dashboard: require('./update_dashboard_i18n.cjs').es.dashboard`;


let parts = i18nContent.split('en: {');
let ptPart = parts[0];
let en_esPart = parts[1].split('es: {');
let enPart = en_esPart[0];
let esPart = en_esPart[1];

ptPart = ptPart.replace(/register: \{[\s\S]*?\n\s*\}/, match => match + ptAdd);
enPart = enPart.replace(/register: \{[\s\S]*?\n\s*\}/, match => match + enAdd);
esPart = esPart.replace(/register: \{[\s\S]*?\n\s*\}/, match => match + esAdd);

fs.writeFileSync('src/i18n.ts', ptPart + 'en: {' + enPart + 'es: {' + esPart);
