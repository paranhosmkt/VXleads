const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

code = code.replace(
  'className="flex-1 flex flex-col justify-center items-center p-8 relative z-10 w-full md:w-1/2"',
  'className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 relative z-10 w-full md:w-1/2"'
);

code = code.replace(
  'className="relative w-[320px] h-[320px] md:w-[450px] md:h-[450px]"',
  'className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[450px] md:h-[450px] mx-auto"'
);

code = code.replace(
  'className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24',
  'className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24'
);

code = code.replace(
  'className="text-4xl md:text-5xl font-black text-indigo-900 mb-12 text-center drop-shadow-sm tracking-tight"',
  'className="text-3xl sm:text-4xl md:text-5xl font-black text-indigo-900 mb-8 md:mb-12 text-center drop-shadow-sm tracking-tight"'
);

fs.writeFileSync('src/pages/Roulette.tsx', code);
