const fs = require('fs');
let code = fs.readFileSync('src/pages/SelectCharacter.tsx', 'utf8');

// replace the logo part
const oldLogo = `        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div className="text-xl font-black text-gray-900 tracking-tighter">
            VX<span className="text-blue-600">Leads</span>
          </div>
        </div>`;

const newLogo = `        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
            <Target size={22} strokeWidth={2.5} />
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tighter">
            VX<span className="text-blue-600">Leads</span>
          </div>
        </div>`;

code = code.replace(oldLogo, newLogo);

// We need to add Target to imports if not there.
if (!code.includes('Target')) {
  code = code.replace("import { User,", "import { User, Target,");
}

fs.writeFileSync('src/pages/SelectCharacter.tsx', code);
