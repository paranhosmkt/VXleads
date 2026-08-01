const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.tsx', 'utf8');

const oldLogo = `        <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Target className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">VX Leads</span>
          </div>
        </div>`;

const newLogo = `        <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-blue-600 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
              <Target size={22} strokeWidth={2.5} />
            </div>
            <div className="text-2xl font-black text-gray-900 tracking-tighter">
              VX<span className="text-blue-600">Leads</span>
            </div>
          </div>
        </div>`;

code = code.replace(oldLogo, newLogo);

fs.writeFileSync('src/pages/Register.tsx', code);
