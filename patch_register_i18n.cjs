const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf-8');

code = code.replace(
  /import \{ Link, useNavigate, useLocation \} from 'react-router-dom';/,
  "import { Link, useNavigate, useLocation } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';\nimport LanguageSwitcher from '../components/LanguageSwitcher';"
);

code = code.replace(
  /export default function Register\(\) \{/,
  "export default function Register() {\n  const { t, i18n } = useTranslation();"
);

// We need to pass the selected currency/language to calculatePrice or formatPrice.
code = code.replace(
  /const formatPrice = \(price: number\) => \{[\s\S]*?\};/,
  `const formatPrice = (price: number) => {
    const lang = i18n.language.split('-')[0];
    let currency = 'BRL';
    let locale = 'pt-BR';
    if (lang === 'en') {
      currency = 'USD';
      locale = 'en-US';
      // simple conversion for demo
      price = price / 5;
    } else if (lang === 'es') {
      currency = 'EUR';
      locale = 'es-ES';
      price = price / 5.5;
    }
    return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 0 }).format(price);
  };`
);

// We can replace the explicit R$ texts with just the formatPrice call for now.
// For Starter: 
code = code.replace(/<span className="text-sm text-gray-400 line-through font-normal">R\$ 797<\/span>/g, '<span className="text-sm text-gray-400 line-through font-normal">{formatPrice(797)}</span>');
code = code.replace(/R\$ \{formatPrice\(calculatePrice\(797\)\)\}/g, '{formatPrice(calculatePrice(797))}');
code = code.replace(/<>R\$ 797 <span/g, '<>{formatPrice(797)} <span');

// For Pro:
code = code.replace(/<span className="text-sm text-gray-400 line-through font-normal">R\$ 1\.497<\/span>/g, '<span className="text-sm text-gray-400 line-through font-normal">{formatPrice(1497)}</span>');
code = code.replace(/R\$ \{formatPrice\(calculatePrice\(1497\)\)\}/g, '{formatPrice(calculatePrice(1497))}');
code = code.replace(/<>R\$ 1\.497 <span/g, '<>{formatPrice(1497)} <span');

// For Enterprise:
code = code.replace(/<span className="text-sm text-gray-400 line-through font-normal">R\$ 2\.997<\/span>/g, '<span className="text-sm text-gray-400 line-through font-normal">{formatPrice(2997)}</span>');
code = code.replace(/R\$ \{formatPrice\(calculatePrice\(2997\)\)\}/g, '{formatPrice(calculatePrice(2997))}');
code = code.replace(/<>R\$ 2\.997 <span/g, '<>{formatPrice(2997)} <span');

// Add language switcher next to VX Leads title
const logoRegex = /<span className="text-xl font-black tracking-tight text-gray-900">VX Leads<\/span>\s*<\/div>/g;
code = code.replace(logoRegex, `<span className="text-xl font-black tracking-tight text-gray-900">VX Leads</span>
            </div>
            <LanguageSwitcher />`);

fs.writeFileSync('src/pages/Register.tsx', code);
