const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf-8');

// Add helper functions
code = code.replace(
  /const handleChange = \(e: React.ChangeEvent<HTMLInputElement \| HTMLSelectElement>\) => \{/,
  `const getDiscountValue = () => {
    if (!discount) return 0;
    const match = discount.match(/\\d+/);
    return match ? parseInt(match[0]) : 0;
  };
  const discountValue = getDiscountValue();
  
  const calculatePrice = (basePrice: number) => {
    if (discountValue === 0) return basePrice;
    return basePrice * (1 - discountValue / 100);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {`
);

// Add banner in Step 1
const textCenterMatch = /<div className="text-center mb-10">\s*<h1 className="text-3xl font-extrabold text-gray-900 mb-4">Escolha seu Plano<\/h1>\s*<p className="text-gray-600 max-w-2xl mx-auto">\s*Selecione o plano que melhor atende às necessidades da sua empresa\. Você poderá alterar depois se precisar\.\s*<\/p>\s*<\/div>/;

if (textCenterMatch.test(code)) {
  code = code.replace(textCenterMatch, `<div className="text-center mb-10">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Escolha seu Plano</h1>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                Selecione o plano que melhor atende às necessidades da sua empresa. Você poderá alterar depois se precisar.
              </p>
              {discount && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl inline-flex items-center gap-3 animate-fade-in-up">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                    <Target size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-emerald-800 font-bold">Você tem um prêmio garantido!</p>
                    <p className="text-emerald-600 text-sm">{discount} válido para a sua primeira contratação.</p>
                  </div>
                </div>
              )}
            </div>`);
}

// Replace Starter price
code = code.replace(
  /<div className="text-2xl font-black text-gray-900 mb-4">R\$ 797 <span className="text-sm font-medium text-gray-500">\/evento<\/span><\/div>/,
  `<div className="text-2xl font-black text-gray-900 mb-4">
                  {discountValue > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400 line-through font-normal">R$ 797</span>
                      <span className="text-emerald-600">R$ {formatPrice(calculatePrice(797))} <span className="text-sm font-medium text-gray-500">/evento</span></span>
                    </div>
                  ) : (
                    <>R$ 797 <span className="text-sm font-medium text-gray-500">/evento</span></>
                  )}
                </div>`
);

// Replace Pro price
code = code.replace(
  /<div className="text-2xl font-black text-gray-900 mb-4">R\$ 1\.497 <span className="text-sm font-medium text-gray-500">\/evento<\/span><\/div>/,
  `<div className="text-2xl font-black text-gray-900 mb-4">
                  {discountValue > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400 line-through font-normal">R$ 1.497</span>
                      <span className="text-emerald-600">R$ {formatPrice(calculatePrice(1497))} <span className="text-sm font-medium text-gray-500">/evento</span></span>
                    </div>
                  ) : (
                    <>R$ 1.497 <span className="text-sm font-medium text-gray-500">/evento</span></>
                  )}
                </div>`
);

// Replace Enterprise price
code = code.replace(
  /<div className="text-2xl font-black text-gray-900 mb-4">R\$ 2\.997 <span className="text-sm font-medium text-gray-500">\/evento<\/span><\/div>/,
  `<div className="text-2xl font-black text-gray-900 mb-4">
                  {discountValue > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400 line-through font-normal">R$ 2.997</span>
                      <span className="text-emerald-600">R$ {formatPrice(calculatePrice(2997))} <span className="text-sm font-medium text-gray-500">/evento</span></span>
                    </div>
                  ) : (
                    <>R$ 2.997 <span className="text-sm font-medium text-gray-500">/evento</span></>
                  )}
                </div>`
);

// Optionally remove the banner from Step 2 if it's there
const step2BannerRegex = /{discount && \(\s*<div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 mb-6 animate-fade-in-up">[\s\S]*?<\/div>\s*\)}/;
if (step2BannerRegex.test(code)) {
  code = code.replace(step2BannerRegex, '');
}

fs.writeFileSync('src/pages/Register.tsx', code);
console.log('Done 3');
