const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

const targetPro = `<li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('pricing.features.support_whatsapp')}</span>
                </li>`;
                
const replacePro = `<li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('pricing.features.support_whatsapp')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 font-semibold text-indigo-700">{t('pricing.features.course_conversion')}</span>
                </li>`;

code = code.replace(targetPro, replacePro);

const targetEnterprise = `<li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('pricing.features.support_247')}</span>
                </li>`;

const replaceEnterprise = `<li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('pricing.features.support_247')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 font-semibold text-indigo-700">{t('pricing.features.community_group')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 font-semibold text-indigo-700">{t('pricing.features.course_conversion')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 font-semibold text-indigo-700">{t('pricing.features.account_manager')}</span>
                </li>`;
                
code = code.replace(targetEnterprise, replaceEnterprise);

fs.writeFileSync('src/pages/Landing.tsx', code);
console.log("Patched Landing.tsx features");
