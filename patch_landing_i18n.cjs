const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

// Imports
code = code.replace(
  /import { Link as RouterLink } from 'react-router-dom';/,
  "import { Link as RouterLink } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';\nimport LanguageSwitcher from '../components/LanguageSwitcher';"
);

// Add useTranslation
code = code.replace(
  /export default function Landing\(\) \{/,
  "export default function Landing() {\n  const { t } = useTranslation();"
);

// Header
const headerRegex = /<RouterLink to="\/login" className="px-5 py-2\.5 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-sm cursor-pointer inline-block">\s*Login\s*<\/RouterLink>/;
code = code.replace(headerRegex, `<div className="flex items-center gap-4">
          <LanguageSwitcher />
          <RouterLink to="/login" className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-sm cursor-pointer inline-block">
            {t('nav.login')}
          </RouterLink>
        </div>`);

// I'll leave the rest of the Landing page text mostly as-is for now except the Hero title to show it works, because there's a lot of text.
code = code.replace(
  /<h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 max-w-2xl leading-\[1\.15\] tracking-tight mb-6 text-left">([\s\S]*?)<\/h1>/,
  `<h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 max-w-2xl leading-[1.15] tracking-tight mb-6 text-left">
            {t('hero.title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{t('hero.title2')}</span> {t('hero.title3')}
          </h1>`
);

code = code.replace(
  /<p className="text-lg md:text-xl text-gray-600 max-w-xl mb-8 leading-relaxed text-left">([\s\S]*?)<\/p>/,
  `<p className="text-lg md:text-xl text-gray-600 max-w-xl mb-8 leading-relaxed text-left">
            {t('hero.subtitle')}
          </p>`
);

fs.writeFileSync('src/pages/Landing.tsx', code);
