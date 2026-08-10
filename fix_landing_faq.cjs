const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');

// The FAQ div contains all these FaqItems.
// We can use a regex to replace everything from the first FaqItem to the last FaqItem.

const newFaqBlock = `            <FaqItem 
              question={t('landing.faq.q1')}
              answer={<span dangerouslySetInnerHTML={{ __html: t('landing.faq.a1') }} />}
            />
            <FaqItem 
              question={t('landing.faq.q2')}
              answer={<span dangerouslySetInnerHTML={{ __html: t('landing.faq.a2') }} />}
            />
            <FaqItem 
              question={t('landing.faq.q3')}
              answer={<span dangerouslySetInnerHTML={{ __html: t('landing.faq.a3') }} />}
            />
            <FaqItem 
              question={t('landing.faq.q4')}
              answer={<span dangerouslySetInnerHTML={{ __html: t('landing.faq.a4') }} />}
            />
            <FaqItem 
              question={t('landing.faq.q5')}
              answer={<span dangerouslySetInnerHTML={{ __html: t('landing.faq.a5') }} />}
            />
            <FaqItem 
              question={t('landing.faq.q6')}
              answer={<span dangerouslySetInnerHTML={{ __html: t('landing.faq.a6') }} />}
            />`;

const startIdx = code.indexOf('<FaqItem');
const endStr = '/>';
// Find the last FaqItem
let lastFaqIdx = code.lastIndexOf('<FaqItem');
let endIdx = code.indexOf(endStr, lastFaqIdx) + endStr.length;

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newFaqBlock + code.substring(endIdx);
  fs.writeFileSync('src/pages/Landing.tsx', code);
  console.log('FAQ patched');
} else {
  console.log('FAQ not found');
}
