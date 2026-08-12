const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

const targetCustom = `<li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">{t('pricing.features.support_dedicated')}</span>
                </li>`;

const replaceCustom = `<li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">{t('pricing.features.support_dedicated')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-yellow-400 font-semibold">{t('pricing.features.community_group')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-yellow-400 font-semibold">{t('pricing.features.course_conversion')}</span>
                </li>`;

code = code.replace(targetCustom, replaceCustom);
fs.writeFileSync('src/pages/Landing.tsx', code);
console.log("Patched Landing Custom");
