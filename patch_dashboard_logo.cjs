const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Add Target to imports
code = code.replace(
  "Settings, FileSpreadsheet\n} from 'lucide-react';",
  "Settings, FileSpreadsheet, Target\n} from 'lucide-react';"
);

// Fix the logo
const oldLogo = `        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg md:text-xl">VX</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate max-w-[120px] md:max-w-none">{companyName}</h1>
            <p className="text-sm text-gray-500">Painel de Controle</p>
          </div>
        </div>`;

const newLogo = `        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-blue-600 text-white p-2 md:p-2.5 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
              <Target size={20} strokeWidth={2.5} className="md:w-[22px] md:h-[22px]" />
            </div>
            <div className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter hidden sm:block">
              VX<span className="text-blue-600">Leads</span>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
          <div>
            <h1 className="text-base md:text-xl font-bold text-gray-900 truncate max-w-[120px] md:max-w-none">{companyName}</h1>
            <p className="text-xs md:text-sm text-gray-500">Painel de Controle</p>
          </div>
        </div>`;

code = code.replace(oldLogo, newLogo);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
