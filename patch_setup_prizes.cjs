const fs = require('fs');
let code = fs.readFileSync('src/pages/SetupPrizes.tsx', 'utf8');

const oldLogo = `        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Gift size={18} className="text-white" />
          </div>
          <div className="text-xl font-black text-gray-900 tracking-tighter">
            VX<span className="text-blue-600">Leads</span>
          </div>
        </div>`;

const newLogo = `        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-blue-600 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
            <Target size={22} strokeWidth={2.5} />
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tighter">
            VX<span className="text-blue-600">Leads</span>
          </div>
        </div>`;

code = code.replace(oldLogo, newLogo);

if (!code.includes('Target')) {
  code = code.replace("import { Gift,", "import { Gift, Target,");
}

fs.writeFileSync('src/pages/SetupPrizes.tsx', code);
